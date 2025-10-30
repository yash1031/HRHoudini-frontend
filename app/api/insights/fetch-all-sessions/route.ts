import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id } = body;
    const authHeader = req.headers.get("authorization");
    console.log("in fetch-all sessions request internal folder")

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/sessions/list?user_id=${user_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json",
            ...(authHeader ? { authorization: authHeader } : {}) },
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
