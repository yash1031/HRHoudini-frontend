export const IS_PROD = process.env.NEXT_PUBLIC_NODE_ENV === "production";
export const NEXT_PUBLIC_APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";
export const NEXT_PUBLIC_COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || ""; // "" in dev, ".hrhoudini.ai" in prod
 
export const COG = {
  REGION: process.env.NEXT_PUBLIC_COG_REGION!,
  DOMAIN: process.env.NEXT_PUBLIC_COG_DOMAIN!, // "<domain>.auth.<region>.amazoncognito.com"
  CLIENT_ID: process.env.NEXT_PUBLIC_COG_CLIENT_ID!,
};
 
export function cookieAttrs() {
  // If domain is set (prod, cross-subdomain), we must use SameSite=None; Secure
  const crossSite = !!NEXT_PUBLIC_COOKIE_DOMAIN;
  return {
    httpOnly: true as const,
    secure: IS_PROD,                // must be true in prod (HTTPS)
    sameSite: (crossSite ? "none" : "lax") as "none" | "lax",
    domain: crossSite ? NEXT_PUBLIC_COOKIE_DOMAIN : undefined,
    path: "/",
  };
}