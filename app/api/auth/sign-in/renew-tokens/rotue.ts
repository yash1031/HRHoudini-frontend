import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try{
    const cookieStore = cookies(); // access browser cookies
    const refreshToken = cookieStore.get("refresh_token");
    // Get Authorization header from incoming request
    
    if (!refreshToken) {
            return NextResponse.json(
                        { error: "No refresh token found" },
                        { status: 401 }
                    );
    }

    const authHeader = req.headers.get("Authorization");

    // Call backend refresh endpoint with refresh_token in request body
    const response = await fetch(`https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/auth/refresh-tokens`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(authHeader ? { Authorization: authHeader } : {}),
            "Refresh_Token": refreshToken.value
        },
    });

    const data = await response.json();

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
