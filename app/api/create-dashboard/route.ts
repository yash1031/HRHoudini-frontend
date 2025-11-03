import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {user_id, session_id, selected_kpis, idempotency_key } = body;
    // const {s3_file_key, selected_kpis } = body;
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
    if (!selected_kpis) {
      return NextResponse.json(
        { error: "selected_kpis is required" },
        { status: 400 }
      );
    }
    if (!idempotency_key) {
      return NextResponse.json(
        { error: "idempotency_key is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
          `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/dashboard/generate`,
          // `https://${process.env.NEXT_PUBLIC_DASHBOARD_LAMBDA_URI}/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json",
            ...(authHeader ? { authorization: authHeader } : {}) },
            body: JSON.stringify({
              user_id: user_id,
              session_id: session_id,
              selected_kpis: selected_kpis,
              idempotency_key: idempotency_key
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
      console.log("Error generating response", error);
      return NextResponse.json(
        { error: "Error generating response" },
        { status: 500 }
      );
    }
}
