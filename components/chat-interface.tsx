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
import { useUserContext } from "@/contexts/user-context"
import { apiFetch } from "@/lib/api/client";

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
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
  suggestedQueries = [],
  welcomeMessage, // Added welcomeMessage parameter
  context = {},
}: ChatInterfaceProps) {
  const defaultWelcomeMessage =
    "Hi! I'm here to help you analyze workforce data, track departmental metrics, and generate insights for your HR initiatives."
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: welcomeMessage || defaultWelcomeMessage,
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]= useState<any>(null)
  const [fromHistory, setFromHistory]= useState<string>("true")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { checkIfTokenExpired } = useUserContext()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(()=>{
    const from_history= localStorage.getItem("from_history")
    setFromHistory(from_history||"true")
  },[])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message?: string) => {
    console.log("Sending the message to get back the results")
    const messageToSend = message || input.trim()
    console.log("Message to send is", messageToSend)
    if (!messageToSend || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    // let access_token= localStorage.getItem("id_token")
    // if(!access_token) console.log("access_token not available")
    let currentPlanRes;
    try{
      currentPlanRes = await apiFetch("/api/billing/get-current-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({
                user_id: localStorage.getItem("user_id")
              }),
        });
    }catch (error) {
      // If apiFetch throws, the request failed
      console.error("Received Error", error);
      setError("Unable to check remaining tokens")
      setTimeout(()=>{
        setError(null);
      }, 3000)
      setIsLoading(false)
      return;
    }
    // const currentPlanRes = await resCurrentPlan;
    // if(!currentPlanRes.ok){
    //   setError("Unable to check remaining tokens")
    //   setTimeout(()=>{
    //     setError(null);
    //   }, 3000)
    //   setIsLoading(false)
    //   return;
    // }

    // const dataCurrentPlan = await currentPlanRes.json();
    // const currentPlanData= await dataCurrentPlan.data
    const currentPlanData= await currentPlanRes.data

    // const dataCurrentPlan = await resCurrentPlan;
    // if (!dataCurrentPlan.ok) throw new Error("Failed to fetch current user plan");
    // const currentPlanData=   await dataCurrentPlan.json();
    console.log("Successfully fetched user's current plan. Result is ", JSON.stringify(currentPlanData))
    console.log("Remaining quotas are", currentPlanData.subscriptions[0].remaining_tokens);
    const tokensNeeded= parseInt(process.env.NEXT_PUBLIC_TOKEN_FOR_CHAT_MESSAGE || "0", 10);
    console.log(tokensNeeded)
    if(currentPlanData.subscriptions[0].remaining_tokens<tokensNeeded){
      setError("File upload quotas are exhausted.")
      setTimeout(()=>{
        setError(null);
      }, 3000)
      setIsLoading(false)
      return;
    }


      // access_token= localStorage.getItem("id_token")
      // if(!access_token) console.log("access_token not available")
      let responseChatMessage
      try{
        responseChatMessage = await apiFetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json"},
          body: JSON.stringify({
                question: messageToSend,
                user_id: localStorage.getItem("user_id"),
                session_id: localStorage.getItem("session_id")
              }),
        });
      }catch (error) {
        // If apiFetch throws, the request failed
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          // content: `I understand you're asking about "${messageToSend}". Based on your ${context.persona ? `role as ${context.persona.replace("-", " ")}` : "profile"}, I can help analyze your HR data. Let me process this request and provide insights relevant to your needs.`,
          content: "Failed to request answer. Try with some other question",
          sender: "assistant",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
        return;
      }

      // const dataChatMessage = await responseChatMessage.json();
      // const chatMessageData= await dataChatMessage.data
      const chatMessageData= await responseChatMessage.data
      console.log("chatMessageData is", JSON.stringify(chatMessageData))
      // if (!responseChatMessage.ok){
      //   const assistantMessage: Message = {
      //     id: (Date.now() + 1).toString(),
      //     // content: `I understand you're asking about "${messageToSend}". Based on your ${context.persona ? `role as ${context.persona.replace("-", " ")}` : "profile"}, I can help analyze your HR data. Let me process this request and provide insights relevant to your needs.`,
      //     content: "Failed to request answer. Try with some other question",
      //     sender: "assistant",
      //     timestamp: new Date(),
      //   }
      //   setMessages((prev) => [...prev, assistantMessage])
      //   setIsLoading(false)
      //   return;
      // }     

      // const responseQuery= await chatMessageData.body;
      // const queryResponse= JSON.parse(responseQuery);


      console.log("queryResponse is", JSON.stringify(chatMessageData))
      console.log("queryResponse natural language response is", chatMessageData.natural_language_response)
      // const tokens_to_consume= queryResponse.token_usage?.total_tokens|| 1800;
      // console.log("Tokens to consume for the chat message", tokens_to_consume)
      // setResponse(queryResponse.natural_language_response)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        // content: `I understand you're asking about "${messageToSend}". Based on your ${context.persona ? `role as ${context.persona.replace("-", " ")}` : "profile"}, I can help analyze your HR data. Let me process this request and provide insights relevant to your needs.`,
        content: chatMessageData.natural_language_response?chatMessageData.natural_language_response:"Failed to fetch answer, try with some other question",
        sender: "assistant",
        timestamp: new Date(),
      }
      console.log("Now consume-tokens API should fire at second place")
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
      // if(!chatMessageData.natural_language_response) return

      // access_token= localStorage.getItem("id_token")
      // if(!access_token) console.log("access_token not available")
      // let resConsumeTokens
      // try{
      //   resConsumeTokens = await apiFetch("/api/billing/consume-tokens", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json"},
      //     body: JSON.stringify({
      //           user_id: localStorage.getItem("user_id"),
      //           action_name: "chat_message",
      //           tokens_to_consume: tokens_to_consume,
      //           event_metadata: {query_length: messageToSend.length, response_length:queryResponse.natural_language_response.length, timestamp: new Date(Date.now())}
      //         }),
      //   });
      // }catch (error) {
      //   // If apiFetch throws, the request failed
      //   console.error("Unable to update tokens for the user")
      //   return;
      // }

      // const currentPlanRes = await resCurrentPlan;
      // if(!resConsumeTokens.ok){
      //   console.error("Unable to update tokens for the user")
      //   return;
      // }

      // const consumeTokensData = await resConsumeTokens.json();
      // const dataConsumeTokens= await consumeTokensData.data
      // const dataConsumeTokens= await resConsumeTokens.data
      // console.log("Token updation for user is successful for chat message", JSON.stringify(dataConsumeTokens));
      
        // if (!resConsumeTokens.ok) throw new Error("Failed to update user_subscription to reduce user tokens for chat message");

        // const dataConsumeTokens = await resConsumeTokens.json();
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

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
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
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
        </ScrollArea>

        {/* Suggested Queries */}
        {/* {suggestedQueries.length > 0 && messages.length <= 1 && ( */}
        {fromHistory==="false" && suggestedQueries.length > 0  && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQueries.slice(0, 3).map((query, index) => (
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
