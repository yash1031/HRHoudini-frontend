import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("MIDDLEWARE HIT:", pathname);

  const res = NextResponse.next();

   //Disable CloudFront + browser caching
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");

  // Allow internal Next.js and static/public assets to load freely
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp)$/) ||
    req.url.includes("code=") || // Google OAuth redirect
    req.url.includes("state=")   // Google OAuth redirect
  ) {
    return res;
  }


  // Get cookies for both login types
  const googleToken = req.cookies.get("access_token")?.value;
  const emailToken = req.cookies.get("rt")?.value;

  const isAuthPage = pathname === "/";
  const isPublicPage = pathname.startsWith("/login") || pathname.startsWith("/verify")  || pathname.startsWith("/account-deleted") || pathname.startsWith("/check-email");
  const isAuthenticated = !!(googleToken || emailToken);

  // Allow public pages without authentication
  if (isPublicPage) {
    return NextResponse.next();
  }

  console.log("isAuthPage", isAuthPage, "isAuthenticated", isAuthenticated)

  // If not authenticated and trying to access a protected page → redirect
  if (!isAuthenticated && !isAuthPage) {
    console.log("User is not authenticated")
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If authenticated but trying to go back to login → redirect to home
  if (isAuthenticated && isAuthPage) {
    console.log("User is authenticated, pulling him back to home")
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
    matcher: [
      /*
      * Match all paths except static files
      */
      '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
