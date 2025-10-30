import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id, session_id, column_headers} = body;
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
    if (!column_headers) {
      return NextResponse.json(
        { error: "column_headers is required" },
        { status: 400 }
      );
    }

    const response = fetch(
    // const response = fetch(
        `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/uploads/session/ai-suggested-questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
            ...(authHeader ? { authorization: authHeader } : {}) },
          body: JSON.stringify({
            user_id: user_id,
            session_id: session_id,
            column_headers: column_headers
          }),
        }
      );

    const dataResponse = await response
    const data= await dataResponse.json();

    return NextResponse.json(
        { success: true, data },
        { status: dataResponse.status }
      );
    } catch (error: any) {
      console.error("Error generating response", error);
      return NextResponse.json(
        { error: "Error generating response" },
        { status: 500 }
      );
    }
}
