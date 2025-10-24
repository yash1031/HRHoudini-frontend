import { CloudCog } from "lucide-react";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    console.log("in socials request internal folder")

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${process.env.NEXT_PUBLIC_STAGE}/account/login`,
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
