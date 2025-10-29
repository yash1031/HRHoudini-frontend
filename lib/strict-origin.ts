import { IS_PROD, APP_ORIGIN } from "./env";
 
export function assertSameSiteRequest(req: Request) {
  if (!IS_PROD) return; // dev: be flexible on localhost
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
 
  // Allow only our app origin in prod
  const ok =
    (origin && origin === APP_ORIGIN) ||
    (referer && referer.startsWith(APP_ORIGIN));
 
  if (!ok) {
    const msg = `Blocked by strict origin policy. Expected ${APP_ORIGIN}`;
    // Throwing here will be caught in the route and turned into 403
    throw new Error(msg);
  }
}