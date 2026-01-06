"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, MessageSquare, Database, AlertCircle, Users, BarChart3, Sparkles, ArrowDown, FileText, BookOpen } from "lucide-react"
import { apiFetch } from "@/lib/api/client";
import { useSearchParams } from "next/navigation"
import { useDashboard } from "@/contexts/dashboard-context"

interface Citation {
  source: string
  filename?: string
  chunk_text?: string
  similarity?: number
  source_type?: "kb" | "user_data"
}

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  industryStandardContent?: string | null
  messageType?: "history" | "current"
  citations?: Citation[]
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
    "Hi! I'm here to help you analyze workforce data, track departmental metrics, and generate insights for your HR initiatives.";
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const fileUploaded = searchParams.get("hasFile");
  const { messages, setMessages, recommendedQuestions, setRecommendedQuestions } = useDashboard();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const oldestChatIdRef = useRef<string | null>(null);
  const shouldScrollRef = useRef(false);
  const isUserScrollingRef = useRef(true);
  const scrollReferenceRef = useRef<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const firstChatMessageIdRef = useRef<boolean>(true);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to format filename (remove path, show just filename)
  const formatFilename = (filename?: string): string => {
    if (!filename) return "Unknown Source";
    return filename.split('/').pop()?.split('\\').pop() || filename;
  };

  // Helper function to check if industry standard content is valid (not null, empty, or placeholder text)
  const hasValidIndustryContent = (content?: string | null): boolean => {
    if (!content) return false;
    const trimmed = content.trim().toLowerCase();
    if (trimmed === "") return false;
    if (trimmed === "null" || trimmed === "none") return false;
    if (trimmed === "suggestions not available") return false;
    if (trimmed === "not available") return false;
    if (trimmed === "n/a") return false;
    return true;
  };

  // Parse citations from API response
  const parseCitations = (responseData: any): Citation[] => {
    const citations: Citation[] = [];
    
    // Priority 1: Check for industry_standard_citations (KB citations from backend)
    if (responseData.industry_standard_citations && Array.isArray(responseData.industry_standard_citations)) {
      responseData.industry_standard_citations.forEach((kbItem: any) => {
        citations.push({
          source: kbItem.filename || kbItem.source || "Knowledge Base",
          filename: kbItem.filename || kbItem.source,
          chunk_text: kbItem.chunk_text || null,
          similarity: typeof kbItem.similarity === 'number' ? kbItem.similarity : (kbItem.relevance_score ? kbItem.relevance_score / 100.0 : 0),
          source_type: "kb"
        });
      });
    }
    
    // Priority 2: Check for kb_results (alternative field name)
    if (responseData.kb_results && Array.isArray(responseData.kb_results)) {
      responseData.kb_results.forEach((kbItem: any) => {
        // Avoid duplicates
        const exists = citations.some(c => c.filename === (kbItem.filename || kbItem.source));
        if (!exists) {
          citations.push({
            source: kbItem.filename || kbItem.source || "Knowledge Base",
            filename: kbItem.filename || kbItem.source,
            chunk_text: kbItem.chunk_text || null,
            similarity: typeof kbItem.similarity === 'number' ? kbItem.similarity : (kbItem.relevance_score ? kbItem.relevance_score / 100.0 : 0),
            source_type: "kb"
          });
        }
      });
    }
    
    // Priority 3: Check for combined citations array
    if (responseData.citations && Array.isArray(responseData.citations)) {
      responseData.citations.forEach((cit: any) => {
        const exists = citations.some(c => c.filename === (cit.filename || cit.source));
        if (!exists) {
          citations.push({
            source: cit.filename || cit.source || (cit.source_type === "kb" ? "Knowledge Base" : "Your Data"),
            filename: cit.filename || cit.source,
            chunk_text: cit.chunk_text || null,
            similarity: typeof cit.similarity === 'number' ? cit.similarity : 0,
            source_type: cit.source_type || "user_data"
          });
        }
      });
    }
    
    // Priority 4: Check for user data sources
    if (responseData.sources && Array.isArray(responseData.sources)) {
      responseData.sources.forEach((source: any) => {
        const exists = citations.some(c => c.filename === (source.filename || source.source));
        if (!exists) {
          citations.push({
            source: source.filename || source.source || "Your Data",
            filename: source.filename || source.source,
            chunk_text: source.chunk_text || null,
            similarity: typeof source.similarity === 'number' ? source.similarity : 0,
            source_type: "user_data"
          });
        }
      });
    }
    
    // Fallback: try to extract from metadata
    if (responseData.metadata?.sources) {
      responseData.metadata.sources.forEach((source: any) => {
        const exists = citations.some(c => c.filename === (source.filename || source.source));
        if (!exists) {
          citations.push({
            source: source.filename || source.source || "Source",
            filename: source.filename || source.source,
            chunk_text: source.chunk_text || null,
            similarity: typeof source.similarity === 'number' ? source.similarity : 0,
            source_type: source.source_type || "user_data"
          });
        }
      });
    }
    
    return citations;
  };

  useEffect(() => {
    const savedChats = sessionStorage.getItem('chats');
    console.log("Chat Component: savedChats are available");
    if (savedChats) {
      console.log("Chat Component: setting chat-messages");
      const parsedChats = JSON.parse(savedChats);
      setMessages(parsedChats);

      // Set oldest chat ID from FIRST history message
      const oldestHistoryMsg = parsedChats.find((m: Message) => m.messageType === "history" || !m.messageType);
      console.log("Chat Component: oldestHistoryMsg", oldestHistoryMsg);
      if (oldestHistoryMsg?.id) {
        const chatId = oldestHistoryMsg.id.substring(0, 36);
        console.log("Chat Component: oldestChatID", chatId);
        oldestChatIdRef.current = chatId;
      }
    }
  }, []);

  useEffect(() => {
    console.log("Chat Component: In useEffect for welcomeMessage", welcomeMessage);
    // Skip on refresh/initial mount
    const savedChats = sessionStorage.getItem('chats');
    console.log("Chat Component: savedChats are available");
    
    if (welcomeMessage && !savedChats) {
      console.log("Chat Component: Setting first chat Message");
      const assistantMessage: Message = {
        id: "welcome",
        content: welcomeMessage || defaultWelcomeMessage,
        sender: "assistant",
        timestamp: new Date(),
        messageType: "current",
      };
      setMessages(() => {
        const updatedMessages = [assistantMessage];
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      const fromHistory = localStorage.getItem("from_history") === "true";
      console.log("Chat Component: fromHistory", fromHistory);
      if (fromHistory) {
        firstChatMessageIdRef.current = false;
        fetchChatHistory(undefined, true);
        return;
      }
    }
  }, [welcomeMessage]);

  const fetchChatHistory = async (beforeChat?: string, shouldScrollToBottom?: boolean) => {
    if (isLoadingHistory || !hasMore) return;

    setIsLoadingHistory(true);
    const sessionId = localStorage.getItem("session_id");
    // Build URL with optional last_chat_id for pagination
    const url = beforeChat
      ? `/api/chat/fetch-history/${sessionId}?limit=2&before_chat=${beforeChat}`
      : `/api/chat/fetch-history/${sessionId}?limit=2`;

    let responseChatHistory;
    try {
      responseChatHistory = await apiFetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      });
    } catch (error) {
      console.log("Unable to fetch chat history", error);
      setIsLoadingHistory(false);
      return;
    }
    const chatHistoryData = await responseChatHistory.data;
    console.log("Chat Component: chatHistoryData", chatHistoryData);
    const chats = chatHistoryData?.chats;
    console.log("Chat Component: history chat are", chats);
    // Handle empty chats
    if (!chats || chats.length === 0) {
      console.log("No more chat history");
      setHasMore(false);
      setIsLoadingHistory(false);
      return;
    }

    // Build all messages first, then update state once
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
        industryStandardContent: chat?.industry_standard_response || null,
        messageType: "history",
        citations: chat?.citations ? (Array.isArray(chat.citations) ? chat.citations : []) : undefined
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
      console.log("Chat Component: updatedMessages", updatedMessages);
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
  };

  useEffect(() => {
    // Only scroll to bottom if flag is set (for new messages, not history)
    if (shouldScrollRef.current) {
      scrollToBottom();
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const handleSend = async (message?: string) => {
    try {
      console.log("Sending the message to get back the results");
      const messageToSend = message || input.trim();
      console.log("Message to send is", messageToSend);
      if (!messageToSend || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        content: messageToSend,
        sender: "user",
        timestamp: new Date(),
        messageType: "current"
      };

      setMessages((prev) => {
        const updatedMessages = [...prev, userMessage];
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      isUserScrollingRef.current = false;
      shouldScrollRef.current = true;
      setInput("");
      setIsLoading(true);

      let responseChatMessage;
      try {
        responseChatMessage = await apiFetch("/api/chat/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: messageToSend,
            user_id: localStorage.getItem("user_id"),
            session_id: fileUploaded == "false" ? '00000000-0000-0000-0000-000000000000' : localStorage.getItem("session_id")
          }),
        });
      } catch (error) {
        // If apiFetch throws, the request failed
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Failed to request answer. Try with some other question",
          sender: "assistant",
          timestamp: new Date(),
          messageType: "current"
        };
        setMessages((prev) => {
          const updatedMessages = [...prev, assistantMessage];
          sessionStorage.setItem('chats', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
        shouldScrollRef.current = true;
        setIsLoading(false);
        setTimeout(() => { isUserScrollingRef.current = true; }, 500);
        return;
      }

      // Display query response
      const chatMessageData = await responseChatMessage.data;

      // Display AI Suggested Questions 
      if (fileUploaded == "true") setRecommendedQuestions(chatMessageData.sample_questions);

      console.log("chatMessageData is", JSON.stringify(chatMessageData, null, 2));
      console.log("queryResponse natural language response is", chatMessageData.natural_language_response);
      console.log("industry_standard_response is", chatMessageData.industry_standard_response);
      console.log("industry_standard_citations is", chatMessageData.industry_standard_citations);

      // Parse citations from response
      let citations: Citation[] = [];
      try {
        citations = parseCitations(chatMessageData);
        console.log("Parsed citations:", citations);
        console.log("Citations count:", citations.length);
        if (citations.length === 0) {
          console.warn("No citations found in response. Available keys:", Object.keys(chatMessageData));
          // Try direct access as fallback
          if (chatMessageData.industry_standard_citations && Array.isArray(chatMessageData.industry_standard_citations)) {
            console.log("Found industry_standard_citations directly:", chatMessageData.industry_standard_citations);
            citations = chatMessageData.industry_standard_citations.map((cit: any) => ({
              source: cit.filename || cit.source || "Unknown",
              filename: cit.filename || cit.source,
              chunk_text: cit.chunk_text || null,
              similarity: typeof cit.similarity === 'number' ? cit.similarity : (cit.relevance_score ? cit.relevance_score / 100.0 : 0),
              source_type: "kb"
            }));
            console.log("Mapped citations from direct access:", citations);
          }
        }
      } catch (parseError) {
        console.error("Error parsing citations:", parseError);
        citations = [];
      }

      // Get industry standard response (keep as null if not available)
      const industryResponse = chatMessageData.industry_standard_response || null;

      // Ensure we have a proper natural language response (not technical fallback)
      let responseContent = chatMessageData.natural_language_response;
      if (!responseContent || responseContent.includes("Query executed successfully") || responseContent.includes("However, I couldn't generate")) {
        // If we got a technical fallback, try to format the data nicely
        console.warn("Received technical fallback message, attempting to format data");
        // The backend should handle this, but just in case, we'll show a user-friendly message
        responseContent = chatMessageData.natural_language_response || "I found results for your query. Please check the data below.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: "assistant",
        timestamp: new Date(),
        industryStandardContent: industryResponse,
        messageType: "current",
        citations: citations.length > 0 ? citations : undefined
      };
      
      console.log("Final assistant message:", {
        content: assistantMessage.content.substring(0, 100),
        hasIndustryContent: !!assistantMessage.industryStandardContent,
        citationsCount: assistantMessage.citations?.length || 0,
        citations: assistantMessage.citations
      });
      
      setMessages((prev) => {
        const updatedMessages = [...prev, assistantMessage];
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      // Update the oldest chat ID for very first message in order to not fetch any chat history from the backend
      if (firstChatMessageIdRef.current) {
        firstChatMessageIdRef.current = false;
        oldestChatIdRef.current = chatMessageData.chat_id;  
      }
      shouldScrollRef.current = true;
      setIsLoading(false);
      setTimeout(() => { isUserScrollingRef.current = true; }, 500);
    } catch (error) {
      console.log("Error in query", error);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Failed to request answer. Try with some other question",
        sender: "assistant",
        timestamp: new Date(),
        messageType: "current"
      };
      setMessages((prev) => {
        const updatedMessages = [...prev, assistantMessage];
        sessionStorage.setItem('chats', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
      setIsLoading(false);
      setTimeout(() => { isUserScrollingRef.current = true; }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // Show button if user scrolled up more than 200px from bottom
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
    setShowScrollButton(!isNearBottom);

    if (!isUserScrollingRef.current || fileUploaded == "false") return;

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

  const handleScrollToBottom = () => {
    isUserScrollingRef.current = false;
    scrollToBottom();
    setTimeout(() => { isUserScrollingRef.current = true; }, 300);
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
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">
            <BookOpen className="h-3 w-3 mr-1" />
            Knowledge Base
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-4 space-y-3 min-h-0">
        {/* Messages Area */}
        <div className="relative flex-1">
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
                <div className="text-xs text-gray-400">All chats are loaded</div>
              </div>
            )}
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  id={message.id} // Add id attribute for scroll targeting 
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%]">
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${
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
                      
                      {/* Debug: Show if citations exist but aren't displaying */}
                      {process.env.NODE_ENV === 'development' && message.sender === "assistant" && message.citations && message.citations.length > 0 && (
                        <div className="mt-2 text-[10px] text-gray-400 italic">
                          [DEBUG] Citations detected: {message.citations.length}
                        </div>
                      )}

                      {/* Industry Standard Response Section - Only show if valid content exists */}
                      {message.sender === "assistant" && hasValidIndustryContent(message.industryStandardContent) && (
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

                      {/* Citations Section - Only show if citations exist */}
                      {/* {message.sender === "assistant" && message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-100">
                          <div className="flex items-center space-x-1 mb-2">
                            <FileText className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-700">
                              Sources ({message.citations.length})
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {message.citations.map((citation, idx) => (
                              <div
                                key={idx}
                                className={`text-xs rounded-md px-2.5 py-2 border transition-colors ${
                                  citation.source_type === "kb"
                                    ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {citation.source_type === "kb" ? (
                                      <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                                    ) : (
                                      <Database className="h-3.5 w-3.5 text-slate-600" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`font-semibold truncate ${
                                        citation.source_type === "kb" ? "text-emerald-800" : "text-slate-800"
                                      }`}>
                                        {formatFilename(citation.filename || citation.source)}
                                      </span>
                                      {citation.source_type === "kb" && (
                                        <Badge 
                                          variant="outline" 
                                          className="text-[9px] px-1.5 py-0 h-4 border-emerald-400 text-emerald-700 bg-emerald-100"
                                        >
                                          KB
                                        </Badge>
                                      )}
                                      {citation.similarity !== undefined && (
                                        <span className={`text-[10px] ${
                                          citation.source_type === "kb" ? "text-emerald-600" : "text-slate-500"
                                        }`}>
                                          • {Math.round(citation.similarity * 100)}% match
                                        </span>
                                      )}
                                    </div>
                                    {citation.chunk_text && (
                                      <p className="mt-1 text-gray-600 line-clamp-2 text-[11px] leading-relaxed">
                                        "{citation.chunk_text.length > 120
                                          ? `${citation.chunk_text.substring(0, 120)}...`
                                          : citation.chunk_text}"
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )} */}
                    </div>
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
            {showScrollButton && (
              <button
                onClick={handleScrollToBottom}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white hover:bg-gray-50 text-gray-700 rounded-full p-3 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl z-10"
                aria-label="Scroll to bottom"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {recommendedQuestions && recommendedQuestions.length > 0 && (
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

