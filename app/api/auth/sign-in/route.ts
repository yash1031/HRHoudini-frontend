import { CloudCog } from "lucide-react";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email} = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    console.log("in socials request internal folder")

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email}), 
        // credentials: 'include'
      }
    );

    const data = await response.json();
    // Create the NextResponse
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward the Set-Cookie header from Lambda to browser
    const setCookieHeader = response.headers.get('Set-Cookie')|| response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;

  } catch (error) {
      return NextResponse.json(
        { error: "Failed to verify code" },
        { status: 500 }
      );
  }
}
