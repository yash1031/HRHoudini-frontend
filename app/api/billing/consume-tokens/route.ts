import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id , action_name, tokens_to_consume, event_metadata } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 }
      );
    }
    if (!action_name) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }
    if (!tokens_to_consume) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }
    if (!event_metadata) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
          `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${process.env.NEXT_PUBLIC_STAGE}/billing/consume-tokens`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user_id,
              action_name: action_name,
              tokens_to_consume: tokens_to_consume,
              event_metadata: event_metadata
            }),
          }
        );

    const data = await response.json();

    return NextResponse.json(
        { success: true, data },
        { status: response.status }
      );
    } catch (error: any) {
      console.error("Error generating response", error);
      return NextResponse.json(
        { error: "Error generating response" },
        { status: 500 }
      );
    }
}
