import { NextResponse } from "next/server";

// POST /api/auth/set-cookie
export async function POST(req: Request) {
  const { token, expiresIn } = await req.json();

  // Set an HTTP-only cookie for secure middleware access
  const res = NextResponse.json({ success: true });

  res.cookies.set("access_token", token, {
    httpOnly: true,      // prevents JavaScript access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn || 3600, // 1 hour default
  });

  return res;
}
