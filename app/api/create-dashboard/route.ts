import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {s3_file_key, selected_kpis } = body;

    if (!s3_file_key) {
      return NextResponse.json(
        { error: "s3_file_key is required" },
        { status: 400 }
      );
    }
    if (!selected_kpis) {
      return NextResponse.json(
        { error: "selected_kpis is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
          `https://${process.env.NEXT_PUBLIC_DASHBOARD_LAMBDA_URI}/`,
          {
            method: "POST",
            // headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              s3_file_key: s3_file_key,
              selected_kpis: selected_kpis
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
