import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, code, session } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "email are required" },
        { status: 400 }
      );
    }
    if (!code) {
      return NextResponse.json(
        { error: "code are required" },
        { status: 400 }
      );
    }
    if (!session) {
      return NextResponse.json(
        { error: "session are required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/verify-token`,
      // `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/auth/verify-magic-link`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email,
          code: code,
          session: session,
        }),
        credentials: 'include'
      }
    );

    const data = await response.json();

        // Get ALL headers including Set-Cookie
    const headers = new Headers();
    
    // Copy all headers from Lambda response
    response.headers.forEach((value, key) => {
      headers.append(key, value);
    });
    // Create the NextResponse
    const nextResponse = NextResponse.json(data, { status: response.status });
    // Forward the Set-Cookie header from Lambda to browser
    const setCookieHeader = response.headers.get('Set-Cookie')|| response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    } else {
      // Fallback: If cookies are in the response body (shouldn't happen with HTTP API)
      if (data.cookies && Array.isArray(data.cookies)) {
        data.cookies.forEach((cookieStr: string) => {
          nextResponse.headers.append('Set-Cookie', cookieStr);
        });
      }
    }

    return nextResponse;

  } catch (error) {
        return NextResponse.json(
        { error: "Failed to verify code" },
        { status: 500 }
        );
  }
}
