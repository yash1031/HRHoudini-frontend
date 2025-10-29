import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
 
const COG_DOMAIN = process.env.COG_DOMAIN!;
const COG_CLIENT_ID = process.env.COG_CLIENT_ID!;
const COG_CLIENT_SECRET = process.env.COG_CLIENT_SECRET || "";
 
function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}
 
export async function POST(_req: NextRequest) {
  try {
    // 1) Basic config validation
    if (!COG_DOMAIN || !COG_CLIENT_ID) {
      return json(500, { error: "server_config_missing", detail: { COG_DOMAIN: !!COG_DOMAIN, COG_CLIENT_ID: !!COG_CLIENT_ID } });
    }
 
    // 2) Cookie check
    const rt = cookies().get("rt")?.value;
    if (!rt) return json(401, { error: "no_refresh_cookie" });
 
    // 3) Compose OAuth request to Cognito
    const url = `${COG_DOMAIN}/oauth2/token`;
    const body = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", rt);
    body.set("client_id", COG_CLIENT_ID);
 
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
    if (COG_CLIENT_SECRET) {
      const basic = Buffer.from(`${COG_CLIENT_ID}:${COG_CLIENT_SECRET}`).toString("base64");
      headers.Authorization = `Basic ${basic}`;
      // (client_id in body is optional when using Basic, but harmless to keep)
    }
 
    // 4) Call Cognito
    const resp = await fetch(url, { method: "POST", headers, body });
    const text = await resp.text();
 
    if (!resp.ok) {
      // Pass through Cognito's status + body so you can see "invalid_client", "invalid_grant", etc.
      return json(resp.status, { error: "cognito_error", status: resp.status, body: text });
    }
 
    const data = JSON.parse(text) as {
      access_token: string;
      id_token?: string;
      expires_in: number;
      refresh_token?: string;
      token_type: string;
    };
 
    // 5) If refresh token rotated, update cookie
    if (data.refresh_token) {
      const isProd = process.env.NODE_ENV === "production";
      const domain = process.env.COOKIE_DOMAIN || undefined;
      (await NextResponse.next()).cookies.set("rt", data.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: domain ? "none" : "lax",
        domain,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
 
    return json(200, {
      access_token: data.access_token,
      id_token: data.id_token,
      expires_in: data.expires_in,
    });
  } catch (e: any) {
    console.error("refresh-route-error:", e);
    return json(500, { error: "server_exception", detail: String(e?.message || e) });
  }
}