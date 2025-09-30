"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, MessageSquare, Clock, FileText } from "lucide-react"

interface ChatConversation {
  id: number
  title: string
  created_at: string
  updated_at: string
  message_count: number
  last_message_preview: string
}

interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface ChatHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelectConversation: (conversation: ChatConversation, messages: ChatMessage[]) => void
  sessionId?: string
}

export function ChatHistoryPanel({
  isOpen,
  onClose,
  onSelectConversation,
  sessionId = "default",
}: ChatHistoryPanelProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen, sessionId])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/chat-history?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation.id)
    try {
      const response = await fetch(`/api/chat-history?sessionId=${sessionId}&conversationId=${conversation.id}`)
      if (response.ok) {
        const data = await response.json()
        onSelectConversation(conversation, data.messages || [])
        onClose()
      }
    } catch (error) {
      console.error("Error fetching conversation messages:", error)
    } finally {
      setSelectedConversation(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      <div className="w-96 bg-white shadow-2xl border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Chat History</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-blue-100 mt-1">Access your previous conversations and insights</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No previous conversations</p>
              <p className="text-gray-400 text-xs mt-1">Start chatting to build your history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                    selectedConversation === conversation.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{conversation.title}</h3>
                      <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                        {conversation.message_count} msgs
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{conversation.last_message_preview}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(conversation.updated_at)}</span>
                      </div>
                      {selectedConversation === conversation.id && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1" onClick={onClose}></div>
    </div>
  )
}
