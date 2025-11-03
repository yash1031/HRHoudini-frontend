import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const is_google = body.is_google === true;

    // If user is Google signed-in, delete access_token cookie directly
    if (is_google) {
      const res = NextResponse.json({ ok: true }, { status: 200 });
      res.cookies.set("access_token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: new Date(0),
        path: "/",
      });
      return res;
    }

    // For non-Google users, call backend logout endpoint
    const response = await fetch(
      `https://${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/account/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: body.access_token,
        }),
        credentials: "include",
      }
    );

    // Clone backend response
    const data = await response.json();
    const nextResponse = NextResponse.json(data, { status: response.status });

    // Forward Set-Cookie header from backend (for rt deletion)
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("[LOGOUT_ERROR]", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
