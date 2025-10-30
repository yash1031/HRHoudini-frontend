type Cached = {
  accessToken: string | null;
  idToken: string | null;
  accessExp: number | null; // seconds since epoch
};
const LSK = {
  access: "access_token",
  id: "id_token",
  exp: "access_token_expiry", // seconds until expiry (or absolute seconds) depending on your backend
};
const cache: Cached = { accessToken: null, idToken: null, accessExp: null };

function readLS(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}
function writeLS(key: string, val: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, val);
}
function removeLS(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function setTokens({
  accessToken,
  idToken,
  exp, // epoch seconds when it expires, OR seconds-from-now; we normalize below
}: {
  accessToken: string;
  idToken?: string;
  exp?: number;
}) {
  cache.accessToken = accessToken || null;
  if (idToken) cache.idToken = idToken;

  // Normalize expiry: if 'exp' is small (e.g., <= 7*24*3600), assume it's duration (expires_in)
  let expEpoch: number | null = null;
  if (typeof exp === "number" && exp > 0) {
    const now = Math.floor(Date.now() / 1000);
    expEpoch = exp > now + 600 ? exp : now + exp; // treat small numbers as "seconds from now"
  }
  cache.accessExp = expEpoch;

  writeLS(LSK.access, accessToken);
  if (idToken) writeLS(LSK.id, idToken);
  if (expEpoch) writeLS(LSK.exp, String(expEpoch));
}

export function loadTokensFromStorage() {
  const at = readLS(LSK.access);
  const it = readLS(LSK.id);
  const expRaw = readLS(LSK.exp);
  cache.accessToken = at;
  cache.idToken = it;
  cache.accessExp = expRaw ? Number(expRaw) : null;
}

export function clearTokens() {
  cache.accessToken = null;
  cache.idToken = null;
  cache.accessExp = null;
  removeLS(LSK.access);
  removeLS(LSK.id);
  removeLS(LSK.exp);
}

export function getAccessToken(): string | null {
  if (cache.accessToken === null) loadTokensFromStorage();
  return cache.accessToken;
}
export function getIdToken(): string | null {
  if (cache.idToken === null) loadTokensFromStorage();
  return cache.idToken;
}
export function isAccessExpiringSoon(bufferSeconds = 30): boolean {
  if (cache.accessExp === null) loadTokensFromStorage();
  if (!cache.accessExp) return false;
  const now = Math.floor(Date.now() / 1000);
  return cache.accessExp - now <= bufferSeconds;
}
