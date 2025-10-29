import { NextRequest, NextResponse } from "next/server";
import { cookieAttrs } from "@/lib/env";
import { assertSameSiteRequest } from "@/lib/strict-origin";
 
export async function POST(req: NextRequest) {
  try {
    assertSameSiteRequest(req);
    const { refresh_token, max_age_seconds = 30 * 24 * 60 * 60 } = await req.json();
 
    if (!refresh_token) {
      return NextResponse.json({ error: "Missing refresh_token" }, { status: 400 });
    }
 
    const res = NextResponse.json({ ok: true });
    res.cookies.set("rt", refresh_token, { ...cookieAttrs(), maxAge: max_age_seconds });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "forbidden" }, { status: 403 });
  }
}