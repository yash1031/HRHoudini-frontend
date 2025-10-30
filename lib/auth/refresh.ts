// /lib/auth/refresh.ts
import { setTokens } from "./tokens";
import { fetchAuthSession} from 'aws-amplify/auth';
 
export async function refreshAccessToken() {
  const is_google_logged_in = localStorage.getItem("is-google-logged-in") === "true";
  if(is_google_logged_in){
    const session = await fetchAuthSession()
    const idToken= session?.tokens?.idToken
    const idTokenPayload = session?.tokens?.idToken?.payload
    const accessToken = session?.tokens?.accessToken // Add this line
    const exp = idTokenPayload?.exp; // Get expiration times (Unix timestamp in seconds)
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const secondsUntilExpiry = exp ? exp - nowInSeconds : 0;
    console.log("Refreshing the tokens for google_logged_in user")
    setTokens({
      accessToken: accessToken? String(accessToken) : "",         // from your backend
      idToken: idToken ? String(idToken) : "",// from Amplify session
      // If your sign-in returns expires_in (seconds), pass it:
      exp: secondsUntilExpiry
    });
    return
  }
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