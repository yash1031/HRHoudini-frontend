"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquare, Database, Users, BarChart3, Sparkles } from "lucide-react"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (message?: string) => {
    console.log("Sending the message to get back the results")
    const messageToSend = message || input.trim()
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

    const response = await fetch(
          "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/nl-to-athena",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: messageToSend,
              user_id: localStorage.getItem("user_id"),
              session_id: localStorage.getItem("session_id")
            }),
          }
        );

      if (!response.ok) throw new Error("Failed to get response for the query");

      const data = await response.json();
      const queryResponse = await JSON.parse(data.body);
      console.log("queryResponse is", queryResponse.natural_language_response)
      // setResponse(queryResponse.natural_language_response)

    // Simulate AI response
    // setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        // content: `I understand you're asking about "${messageToSend}". Based on your ${context.persona ? `role as ${context.persona.replace("-", " ")}` : "profile"}, I can help analyze your HR data. Let me process this request and provide insights relevant to your needs.`,
        content: queryResponse.natural_language_response,
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    // }, 1500)
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
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Queries */}
        {suggestedQueries.length > 0 && messages.length <= 1 && (
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
