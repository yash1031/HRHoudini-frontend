import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const response = await fetch(
      "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/auth/request-magic-link",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to request magic code" },
      { status: 500 }
    );
  }
}
