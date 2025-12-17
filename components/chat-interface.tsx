"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, MessageSquare, Database, AlertCircle, Users, BarChart3, Sparkles } from "lucide-react"
import { apiFetch } from "@/lib/api/client";
import { useSearchParams } from "next/navigation"
import { useDashboard } from "@/contexts/dashboard-context"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  industryStandardContent?: string
  messageType?: "history" | "current" 
}

interface ChatInterfaceProps {
  placeholder?: string
  suggestedQueries?: string[]
  welcomeMessage?: string // Added custom welcome message prop
  context?: {
    persona?: string
    company?: string
    companyData?: any
    challenges?: string[]
  }
}

export function ChatInterface({
  placeholder = "Ask me anything about your HR data...",
  welcomeMessage, // Added welcomeMessage parameter
}: ChatInterfaceProps) {

  const defaultWelcomeMessage =
    "Hi! I'm here to help you analyze workforce data, track departmental metrics, and generate insights for your HR initiatives."
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]= useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams= useSearchParams()
  const fileUploaded= searchParams.get("hasFile")
  const {messages, setMessages, recommendedQuestions, setRecommendedQuestions} = useDashboard()
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const oldestChatIdRef = useRef<string | null>(null);
  const shouldScrollRef = useRef(false);
  const isUserScrollingRef = useRef(true);
  const scrollReferenceRef = useRef<string | null>(null); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(()=>{
    const savedChats = sessionStorage.getItem('chats');
    console.log("Chat Component: savedChats are available")
    if (savedChats) {
      console.log("Chat Component: setting chat-messages");
      const parsedChats = JSON.parse(savedChats);
      setMessages(parsedChats);

      // Set oldest chat ID from FIRST history message
      const oldestHistoryMsg = parsedChats.find((m: Message) => m.messageType === "history" || !m.messageType);
      console.log("Chat Component: oldestHistoryMsg", oldestHistoryMsg)
      if (oldestHistoryMsg?.id) {
        const chatId = oldestHistoryMsg.id.substring(0,36);
        console.log("Chat Component: oldestChatID", chatId)
        oldestChatIdRef.current = chatId;
      }
    }
  },[])

  useEffect(() => {
    console.log("Chat Component: In useEffect for welcomeMessage", welcomeMessage)
    // Skip on refresh/initial mount
    const savedChats = sessionStorage.getItem('chats');
    console.log("Chat Component: savedChats are available")
    
    if (welcomeMessage && !savedChats) {
      console.log("Chat Component: Setting first chat Message")
      const assistantMessage: Message= {
        id: "welcome",
        content: welcomeMessage || defaultWelcomeMessage,
        sender: "assistant",
        timestamp: new Date(),
        messageType: "current", 
      }
      setMessages(() => {
        const updatedMessages = [assistantMessage]
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages))
        return updatedMessages
      })
      const fromHistory= localStorage.getItem("from_history")==="true"
      console.log("Chat Component: fromHistory",fromHistory, "welcomeMessage updated", welcomeMessage)
      if(fromHistory){ 
        fetchChatHistory(undefined, true)
        return
      }
    }
  }, [welcomeMessage])

  const fetchChatHistory = async (beforeChat?: string, shouldScrollToBottom?: boolean) =>{
      if (isLoadingHistory || !hasMore) return;
      
      setIsLoadingHistory(true);
      const sessionId= localStorage.getItem("session_id")
      // Build URL with optional last_chat_id for pagination
      const url = beforeChat 
        ? `/api/chat/fetch-history/${sessionId}?limit=2&before_chat=${beforeChat}`
        : `/api/chat/fetch-history/${sessionId}?limit=2`;
      
      let responseChatHistory;
      try {
        responseChatHistory = await apiFetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.log("Unable to fetch chat history", error);
        setIsLoadingHistory(false);
        return;
      }
      const chatHistoryData= await responseChatHistory.data
      console.log("Chat Component: chatHistoryData", chatHistoryData)
      const chats= chatHistoryData?.chats
      console.log("Chat Component: history chat are", chats)
      // Handle empty chats
      if (!chats || chats.length === 0) {
        console.log("No more chat history");
        setHasMore(false);
        setIsLoadingHistory(false);
        return; 
      }

		  //Build all messages first, then update state once
		  const historyMessages: Message[] = [];

		  chats.forEach((chat: any) => { 
        // console.log("ChatHistory: individual chat", chat);
        
        const userMessage: Message = {
          id: `${chat?.chat_id}-user`, // Unique ID
          content: chat?.question,
          sender: "user",
          timestamp: new Date(chat?.created_at),
          messageType: "history"
        };
        
        const assistantMessage: Message = {
          id: `${chat?.chat_id}-assistant`, // Unique ID
          content: chat?.response,
          sender: "assistant",
          timestamp: new Date(chat?.created_at),
          industryStandardContent: chat?.industry_standard_response || "Suggestions not available", 
          messageType: "history"
        };
        
        historyMessages.push(userMessage, assistantMessage);
		  });

		  // Update oldest chat ID for next pagination
      oldestChatIdRef.current = chats[0]?.chat_id;

      // Insert history at the BEGINNING
      setMessages((prev) => {
        // Find where current messages start
        const firstCurrentIndex = prev.findIndex(m => m.messageType === "current");
        
        let updatedMessages;
        if (firstCurrentIndex === -1) {
          // Insert history BEFORE current messages
          const existingHistory = prev.filter(m => m.messageType === "history" || !m.messageType);
          // No current messages yet, append history
          updatedMessages = [...existingHistory, ...historyMessages];
        } else {
          // Insert history BEFORE current messages
          const existingHistory = prev.filter(m => m.messageType === "history" || !m.messageType);
          const currentMessages = prev.filter(m => m.messageType === "current");
          updatedMessages = [...historyMessages, ...existingHistory, ...currentMessages];
        }
        console.log("Chat Component: updatedMessages", updatedMessages)
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      
      setIsLoadingHistory(false);

      // Handle scrolling based on context
      if (shouldScrollToBottom) {
        // Initial load from history - scroll to bottom
        setTimeout(() => {
          shouldScrollRef.current = true;
          scrollToBottom();
        }, 100);
      } else if (scrollReferenceRef.current) {
        // Scroll up pagination - restore scroll position
        setTimeout(() => {
          const referenceElement = document.getElementById(scrollReferenceRef.current!);
          if (referenceElement) {
            referenceElement.scrollIntoView({ block: "start" });
            console.log("Scrolled back to reference:", scrollReferenceRef.current);
          }
          scrollReferenceRef.current = null;
        }, 100);
	    }
  }
  useEffect(() => {
    // Only scroll to bottom if flag is set (for new messages, not history)
    if (shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const handleSend = async (message?: string) => {
    try{
      console.log("Sending the message to get back the results")
      const messageToSend = message || input.trim()
      console.log("Message to send is", messageToSend)
      if (!messageToSend || isLoading) return

      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageToSend,
        sender: "user",
        timestamp: new Date(),
        messageType: "current"
      }

      setMessages((prev) => {
        const updatedMessages = [...prev, userMessage]
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages))
        return updatedMessages
      })

      isUserScrollingRef.current = false;
      shouldScrollRef.current = true; 
      setInput("")
      setIsLoading(true)

      let resAISuggestedQuestions = apiFetch("/api/file-upload/generate-recommended-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json",},
          body: JSON.stringify({
              user_id: localStorage.getItem("user_id"),
              session_id: localStorage.getItem("session_id"),
              column_headers: JSON.parse(sessionStorage.getItem("columns")||"[]")
            }),
        }).catch((error) => {
            setRecommendedQuestions([])
            console.error("Chat Component Failed to create AI recommended question", error)
          });

      let responseChatMessage
      try{
        responseChatMessage = await apiFetch("/api/chat/request", {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({
                question: messageToSend,
                user_id: fileUploaded=="false" ? process.env.NEXT_PUBLIC_SAMPLE_USER_ID: localStorage.getItem("user_id"),
                session_id: fileUploaded=="false" ? process.env.NEXT_PUBLIC_SAMPLE_FILE_SESSION_ID: localStorage.getItem("session_id")
              }),
        });
      }catch (error) {
        // If apiFetch throws, the request failed
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Failed to request answer. Try with some other question",
          sender: "assistant",
          timestamp: new Date(),
          messageType: "current"
        }
        setMessages((prev) => {
          const updatedMessages = [...prev, assistantMessage]
          sessionStorage.setItem('chats', JSON.stringify(updatedMessages))
          return updatedMessages
        })
        shouldScrollRef.current = true; 
        setIsLoading(false)
        setTimeout(() => { isUserScrollingRef.current = true; }, 500); // Re-enable after scroll completes
        return;
      }

      // Display AI Suggested Questions first then chat response
      const resAISuggestedQues= await resAISuggestedQuestions

      if(resAISuggestedQues){
        const AISuggestedQuesData= await resAISuggestedQues.data
        console.log("Chat Component: Successfully generated AI Recommended Ques.", AISuggestedQuesData)
        setRecommendedQuestions(AISuggestedQuesData.sample_questions)
      }

      // Display query response
      const chatMessageData= await responseChatMessage.data

      // console.log("chatMessageData is", JSON.stringify(chatMessageData))

      // console.log("queryResponse is", JSON.stringify(chatMessageData))
      // console.log("queryResponse natural language response is", chatMessageData.natural_language_response)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: chatMessageData.natural_language_response?chatMessageData.natural_language_response:"Failed to fetch answer. Try with some other question",
        sender: "assistant",
        timestamp: new Date(),
        industryStandardContent: chatMessageData.industry_standard_response || "Suggestions Not Available",
        messageType: "current", 
      }
      setMessages((prev) => {
        const updatedMessages = [...prev, assistantMessage]
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages))
        return updatedMessages
      })
      shouldScrollRef.current = true; 
      setIsLoading(false)
      setTimeout(() => { isUserScrollingRef.current = true; }, 500); // Re-enable after scroll completes
    } catch(error){
      console.log("Error in query")
      const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Failed to request answer. Try with some other question",
          sender: "assistant",
          timestamp: new Date(),
          messageType: "current"
        }
        setMessages((prev) => {
          const updatedMessages = [...prev, assistantMessage]
          sessionStorage.setItem('chats', JSON.stringify(updatedMessages))
          return updatedMessages
        })
        setIsLoading(false)
        setTimeout(() => { isUserScrollingRef.current = true; }, 500);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isUserScrollingRef.current) return; // Skip if programmatic scroll
    
    const target = e.currentTarget;
    const { scrollTop } = target;
    
    // Load more when scrolling UP near TOP (within 100px from top)
    if (scrollTop < 100 && hasMore && !isLoadingHistory) {
      console.log("Chat Component: Near top, loading older chats...");

      // Save the FIRST visible message as scroll reference
      const firstVisibleMessage = messages.find(m => m.messageType === "history" || !m.messageType);
      if (firstVisibleMessage) {
        scrollReferenceRef.current = firstVisibleMessage.id;
        console.log("Chat Component: Saved scroll reference:", scrollReferenceRef.current);
      }

      fetchChatHistory(oldestChatIdRef.current || undefined, false);
    }
  };

  return (
    <Card className="w-full flex flex-col shadow-xl border-2 border-blue-100 bg-gradient-to-b from-white to-blue-50/30">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-100" />
          <CardTitle className="text-lg text-white">HR Houdini</CardTitle>
        </div>
        <CardDescription className="text-blue-100">Ask questions about your HR data</CardDescription>

        {/* Data Source Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Database className="h-3 w-3 mr-1" />
            Employee Data
          </Badge>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Users className="h-3 w-3 mr-1" />
            Headcount
          </Badge>
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
            <BarChart3 className="h-3 w-3 mr-1" />
            Surveys
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-4 space-y-3 min-h-0">
        {/* Messages Area */}
        <div  
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50"
        >
          {/* Loading indicator at TOP */}
          {isLoadingHistory && (
            <div className="flex justify-center py-2">
              <div className="text-xs text-gray-500">Loading older chats...</div>
            </div>
          )}

          {/* No more chats indicator at TOP */}
          {!hasMore && messages.some(m => m.messageType === "history" || !m.messageType) && (
            <div className="flex justify-center py-2">
              <div className="text-xs text-gray-400">All chats are available</div>
            </div>
          )}
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id}
                id={message.id} // Add id attribute for scroll targeting 
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white text-gray-900 border border-blue-200 shadow-sm"
                  }`}
                >
                  {message.sender === "assistant" && message.id === "welcome" && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Welcome!</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {/* Industry Standard Response Section  */}
                  {message.sender === "assistant" && message.industryStandardContent && (
                    <div className="mt-3 pt-3 border-t border-blue-100">
                      <div className="flex items-center space-x-1 mb-2">
                        <BarChart3 className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">Industry Insight</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5">
                        <p className="text-xs text-amber-900 leading-relaxed">{message.industryStandardContent}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-gray-600">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        { recommendedQuestions && recommendedQuestions.length > 0  && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {recommendedQuestions.slice(0, 3).map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSend(query)}
                  disabled={isLoading}
                >
                  {query}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Input Area - Inside the card with prominent styling */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 shadow-inner">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isLoading}
                className="text-base h-12 px-4 bg-white border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm placeholder:text-gray-500 font-medium"
              />
              {!input && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Send className="h-5 w-5 mr-2" />
              Send
            </Button>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-blue-600 font-medium">
              HR Houdini can make mistakes. Please double-check responses.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
