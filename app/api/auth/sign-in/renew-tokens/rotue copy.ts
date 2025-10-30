import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try{
    const cookieStore = cookies(); // access browser cookies
    const refreshToken = cookieStore.get("rt");
    // Get Authorization header from incoming request

    console.log("=== Renew Tokens Route ===");
    console.log("Refresh token from cookie:", refreshToken?.value ? "exists" : "missing");
    
    
    if (!refreshToken) {
            return NextResponse.json(
                        { error: "No refresh token found" },
                        { status: 401 }
                    );
    }

    const authHeader = req.headers.get("authorization");
    console.log("Authorization header from renew tokens:", authHeader);

    console.log("authHeader from renew tokens ", authHeader)

    // Call backend refresh endpoint with refresh_token in request body
    const response = await fetch('https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/account/refresh-token', {
    // const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/refresh-token`, {
    // const response = await fetch(`https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/auth/refresh-tokens`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": `rt=${refreshToken}`, // Forward the refresh token
            // ...(authHeader ? { authorization: authHeader } : {}),
            // "refresh_token": refreshToken.value
        },
    });

    const data = await response.json();
    console.log("data from renew tokens", data)

    // Create the NextResponse
    const nextResponse = NextResponse.json(data, { status: response.status });
    // Forward the Set-Cookie header from Lambda to browser
    const setCookieHeader = response.headers.get('Set-Cookie')|| response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  }catch (error) {
        console.log("Failed to renew tokens. Error: "+ error)
        return NextResponse.json(
            { error: "Failed to renew tokens" },
            { status: 500 }
        );
    }
}
