import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("Renew tokens endpoint hit");
    
    // Extract refresh token from cookies
    const refreshToken = request.cookies.get("rt")?.value;

    if (!refreshToken) {
      console.error("No refresh token found in cookies");
      return NextResponse.json(
        { error: "missing_refresh_token" },
        { status: 400 }
      );
    }

    console.log("Refresh token found, calling backend...");

    // Call your Lambda backend
    const backendUrl = `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/${process.env.NEXT_PUBLIC_STAGE}/account/refresh-token`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": `rt=${refreshToken}`, // Forward the refresh token
      },
    });

    if (!response.ok) {
      console.error("Backend refresh failed:", response.status);
      return NextResponse.json(
        { error: "refresh_failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Backend refresh successful");

    // Create response with new tokens
    const res = NextResponse.json({
      access_token: data.access_token,
      id_token: data.id_token,
      expires_in: data.expires_in,
    });

    // If backend returned a new refresh token cookie, forward it
    const setCookieHeader = response.headers.get("set-cookie");
    if (setCookieHeader) {
      res.headers.set("Set-Cookie", setCookieHeader);
    }

    return res;
    
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}