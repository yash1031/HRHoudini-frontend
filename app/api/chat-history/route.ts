import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

const sql = neon(process.env.DATABASE_URL!)

// Get chat history for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId") || "default"
    const conversationId = searchParams.get("conversationId")

    if (conversationId) {
      // Get specific conversation with messages
      const conversation = await sql`
        SELECT * FROM chat_conversations 
        WHERE id = ${conversationId} AND session_id = ${sessionId}
      `

      if (conversation.length === 0) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      const messages = await sql`
        SELECT * FROM chat_messages 
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
      `

      return NextResponse.json({
        conversation: conversation[0],
        messages: messages,
      })
    } else {
      // Get all conversations for session
      const conversations = await sql`
        SELECT * FROM chat_conversations 
        WHERE session_id = ${sessionId}
        ORDER BY updated_at DESC
        LIMIT 50
      `

      return NextResponse.json({ conversations })
    }
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Save chat conversation
export async function POST(request: NextRequest) {
  try {
    const { sessionId = "default", userMessage, assistantMessage, conversationId } = await request.json()

    let currentConversationId = conversationId

    if (!currentConversationId) {
      // Create new conversation
      const title = userMessage.length > 50 ? userMessage.substring(0, 50) + "..." : userMessage

      const newConversation = await sql`
        INSERT INTO chat_conversations (session_id, title, message_count, last_message_preview)
        VALUES (${sessionId}, ${title}, 2, ${assistantMessage.substring(0, 200) + "..."})
        RETURNING id
      `

      currentConversationId = newConversation[0].id
    } else {
      // Update existing conversation
      await sql`
        UPDATE chat_conversations 
        SET updated_at = CURRENT_TIMESTAMP,
            message_count = message_count + 2,
            last_message_preview = ${assistantMessage.substring(0, 200) + "..."}
        WHERE id = ${currentConversationId}
      `
    }

    // Save user message
    await sql`
      INSERT INTO chat_messages (conversation_id, role, content)
      VALUES (${currentConversationId}, 'user', ${userMessage})
    `

    // Save assistant message
    await sql`
      INSERT INTO chat_messages (conversation_id, role, content)
      VALUES (${currentConversationId}, 'assistant', ${assistantMessage})
    `

    return NextResponse.json({
      success: true,
      conversationId: currentConversationId,
    })
  } catch (error) {
    console.error("Error saving chat history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
