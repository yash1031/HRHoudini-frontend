// /lib/auth/refresh.ts
import { setTokens } from "./tokens";
 
export async function refreshAccessToken() {
  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include", // sends rt cookie to same-origin route
  });
  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  setTokens({
    accessToken: data.access_token,
    idToken: data.id_token,
    exp: data.expires_in, // seconds from now
  });
}