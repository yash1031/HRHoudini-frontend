import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id, session_id, file_type} = body;

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
    if (!file_type) {
      return NextResponse.json(
        { error: "file_type is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${process.env.NEXT_PUBLIC_STAGE}/csv-parquet-processor`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user_id,
            session_id: session_id,
            file_type: file_type,
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
