// app/api/auth/create-account/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, subscription_plan_name, is_billed_annually } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }
    if (!subscription_plan_name) {
      return NextResponse.json(
        { error: "subscription_plan_name is required" },
        { status: 400 }
      );
    }
    if (is_billed_annually=== null ||is_billed_annually=== undefined) {
      return NextResponse.json(
        { error: "is_billed_annually is required" },
        { status: 400 }
      );
    }

    // Call your AWS API Gateway
    const response = await fetch(
      "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/billing/purchase",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, subscription_plan_name, is_billed_annually }),
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
