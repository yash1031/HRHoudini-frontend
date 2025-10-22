import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id, session_id, s3_location, analytical_json_output } = body;
    const authHeader = req.headers.get("authorization");
    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }
    if (!session_id) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }
    if (!s3_location) {
      return NextResponse.json(
        { error: "s3_location is required" },
        { status: 400 }
      );
    }
    if (!analytical_json_output) {
      return NextResponse.json(
        { error: "analytical_json_output is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
            `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${process.env.NEXT_PUBLIC_STAGE}/update-chat-history`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json",
            ...(authHeader ? { authorization: authHeader } : {}) },
              body: JSON.stringify({
                user_id: user_id,
                session_id: session_id,
                s3_location: s3_location,
                analytical_json_output: analytical_json_output
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
