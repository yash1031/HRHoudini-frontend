
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: "full_name are required" },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: "company_email are required" },
        { status: 400 }
      );
    }

    // Call your AWS API Gateway
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${process.env.NEXT_PUBLIC_STAGE}/auth/cognito-insert`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
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
      { data: "Failed to create account" },
      { status: 500 }
    );
  }
}
