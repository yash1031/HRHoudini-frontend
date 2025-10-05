"use client"

import type React from "react"
import { useState, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, History } from "lucide-react"
import { ChatHistoryPanel } from "@/components/chat-history-panel"

interface MinimalChatInputProps {
  placeholder?: string
  onSend?: (message: string) => void
  className?: string
  sessionId?: string
}

interface MinimalChatInputRef {
  sendMessage: (message: string) => void
}

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface ChatConversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count: number
  last_message_preview: string
}

export const MinimalChatInput = forwardRef<MinimalChatInputRef, MinimalChatInputProps>(
  ({ placeholder = "Ask me about your HR data...", onSend, className = "", sessionId = "default" }, ref) => {
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState<string | null>(null)
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
    const [showHistory, setShowHistory] = useState(false)

    const handleSend = async (messageToSend?: string) => {
      const message = messageToSend || input.trim()
      console.log("The Message to be send is", messageToSend)
      if (!message || isLoading) return

      setIsLoading(true)
      setInput("")
      setResponse(null)
      setCurrentQuestion(message)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            context: {
              company: "Sharp Median",
              persona: "hr-analyst",
            },
          }),
        })

        if (!res.ok) {
          throw new Error("Failed to get response")
        }

        const data = await res.json()
        setResponse(data.message)

        try {
          await fetch("/api/chat-history", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId,
              userMessage: message,
              assistantMessage: data.message,
              conversationId: currentConversationId,
            }),
          })
        } catch (historyError) {
          console.error("Error saving to history:", historyError)
          // Don't fail the main chat if history save fails
        }

        if (onSend) {
          onSend(message)
        }
      } catch (error) {
        console.error("Error sending message")
        setResponse("I encountered an issue processing your request. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    const handleSelectConversation = (conversation: ChatConversation, messages: ChatMessage[]) => {
      setCurrentConversationId(conversation.id)

      if (messages.length > 0) {
        const lastUserMessage = messages.filter((m) => m.role === "user").pop()
        const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()

        if (lastUserMessage && lastAssistantMessage) {
          setCurrentQuestion(lastUserMessage.content)
          setResponse(lastAssistantMessage.content)
        }
      }
    }

    useImperativeHandle(ref, () => ({
      sendMessage: (message: string) => {
        setInput(message)
        handleSend(message)
      },
    }))

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }

    return (
      <>
        {response && (
          <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 max-h-96 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              {currentQuestion && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">You asked</span>
                  </div>
                  <div className="text-sm text-gray-800">{currentQuestion}</div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-900">HR Houdini</span>
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-line">{response}</div>
                <button
                  onClick={() => {
                    setResponse(null)
                    setCurrentQuestion(null)
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 border-t-4 border-blue-400 shadow-2xl z-50 ${className}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowHistory(true)}
                variant="ghost"
                size="lg"
                className="h-14 px-4 bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 rounded-xl shadow-lg transition-all duration-200"
                title="View chat history"
              >
                <History className="h-5 w-5" />
              </Button>

              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  disabled={isLoading}
                  className="h-14 text-base border-2 border-white/20 bg-white/95 backdrop-blur-sm focus:border-white focus:ring-4 focus:ring-white/30 rounded-xl shadow-lg placeholder:text-gray-500"
                />
              </div>
              <Button
                onClick={(e) => handleSend(input)}
                // onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="lg"
                className="h-14 px-8 bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-xl shadow-lg border-2 border-white/20 transition-all duration-200"
              >
                <Send className="h-5 w-5 mr-2" />
                {isLoading ? "Analyzing..." : "Send"}
              </Button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-xs text-white/80">HR Houdini can make mistakes. Please double-check responses.</p>
            </div>
          </div>
        </div>

        <ChatHistoryPanel
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          onSelectConversation={handleSelectConversation}
          sessionId={sessionId}
        />
      </>
    )
  },
)

MinimalChatInput.displayName = "MinimalChatInput"
