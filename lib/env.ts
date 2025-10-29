export const IS_PROD = process.env.NODE_ENV === "production";
export const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || ""; // "" in dev, ".hrhoudini.ai" in prod
 
export const COG = {
  REGION: process.env.COG_REGION!,
  DOMAIN: process.env.COG_DOMAIN!, // "<domain>.auth.<region>.amazoncognito.com"
  CLIENT_ID: process.env.COG_CLIENT_ID!,
};
 
export function cookieAttrs() {
  // If domain is set (prod, cross-subdomain), we must use SameSite=None; Secure
  const crossSite = !!COOKIE_DOMAIN;
  return {
    httpOnly: true as const,
    secure: IS_PROD,                // must be true in prod (HTTPS)
    sameSite: (crossSite ? "none" : "lax") as "none" | "lax",
    domain: crossSite ? COOKIE_DOMAIN : undefined,
    path: "/",
  };
}