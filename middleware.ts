import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow internal Next.js and static/public assets to load freely
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/) ||
    req.url.includes("code=") || // ✅ Google OAuth redirect
    req.url.includes("state=")   // ✅ Google OAuth redirect
  ) {
    return NextResponse.next();
  }


  // Get cookies for both login types
  const googleToken = req.cookies.get("access_token")?.value;
  const emailToken = req.cookies.get("rt")?.value;

  const isAuthPage = pathname === "/";
  const isPublicPage = pathname === "/login/privacy-policy" || pathname === "/login/terms-of-service";
  const isAuthenticated = !!(googleToken || emailToken);

  // Allow public pages without authentication
  if (isPublicPage) {
    return NextResponse.next();
  }

  // If not authenticated and trying to access a protected page → redirect
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If authenticated but trying to go back to login → redirect to dashboard
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/onboarding-upload-only", req.url));
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"],
};
