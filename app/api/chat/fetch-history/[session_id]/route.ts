import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function GET(request: NextRequest,
  { params }: { params: { session_id: string } }) {
  try {
    const session_id = params.session_id;
    const authHeader = request.headers.get("authorization");
    
    // Get user_id from query params or auth context
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const before_chat = searchParams.get('before_chat');
    if (!session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/sessions/${session_id}/chat-history?limit=${limit}&before_chat=${before_chat}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json",
            ...(authHeader ? { authorization: authHeader } : {}) },
      }
    );

    const data = await response.json();

    return NextResponse.json(
        { success: true, data },
        { status: response.status,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          } 
        }
      );
    } catch (error: any) {
      console.error("Error generating response", error);
      return NextResponse.json(
        { error: "Error generating response" },
        { status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          }
        }
      );
    }
}
