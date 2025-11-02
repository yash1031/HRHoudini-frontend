import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();

    // Call backend logout endpoint
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      }
    );

    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });

    // --- Remove whichever auth cookie is present (Google or Email) ---
    // --- Remove whichever auth cookie is present (Google or Email) ---
    const domain = process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || 'localhost'

    const cookieNames: string[] = ["rt", "access_token"];
    cookieNames.forEach((name) => {
      nextResponse.cookies.set(name, "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
        domain,
      });
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