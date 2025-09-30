// app/api/auth/create-account/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, company_email } = body;

    if (!full_name || !company_email) {
      return NextResponse.json(
        { error: "full_name and company_email are required" },
        { status: 400 }
      );
    }

    // Call your AWS API Gateway
    const response = await fetch(
      "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/auth/create-account",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, company_email }),
      }
    );

    const data = await response.json();

    return NextResponse.json(
      { success: true, data },
      { status: response.status }
    );
  } catch (error: any) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
