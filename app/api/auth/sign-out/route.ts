import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    // Call backend logout endpoint
    const response = await fetch(
      "https://9tg2uhy952.execute-api.us-east-1.amazonaws.com/dev/auth/logout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      }
    );

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Remove the refresh_token cookie regardless of backend response
    // This ensures the client is logged out even if backend call fails
    nextResponse.cookies.set("refresh_token", "", {
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(0), // Set to past date to delete
      path: "/",
      domain: "localhost",
    });
    return nextResponse;

  } catch (error) {
    console.error("Failed to logout:", error);
    
    // Even if backend fails, still remove cookies for client-side logout
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}