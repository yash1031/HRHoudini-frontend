
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, user_id } = body;

    if (!token) {
      return NextResponse.json(
        { error: "token is required" },
        { status: 400 }
      );
    }
    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Call your AWS API Gateway
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/verify-email?token=${token}&user_id=${user_id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        redirect: "manual",
      }
    );

    // Handle 302 redirect from Lambda
    if (response.status === 302) {
      const redirectUrl = response.headers.get("Location");
      return NextResponse.json(
        { success: true, redirectUrl: redirectUrl },
        { status: 200 }
      );
    }
    const data = await response.json();

    return NextResponse.json(
        { success: true, data },
        { status: response.status }
      );
    
  } catch (error: any) {
    console.error("Failed to verify email:", error);
    return NextResponse.json(
      { data: "Failed to verify email" },
      { status: 500 }
    );
  }
}
