import { getAccessToken, getIdToken, isAccessExpiringSoon } from "@/lib/auth/tokens";
import { refreshAccessToken } from "@/lib/auth/refresh";

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { autoJson = true }: { autoJson?: boolean } = {}
) {
  // Pre-emptive refresh if expiring soon
  // if (true) {
  //   try { await refreshAccessToken(); } catch {}
    
  // }
  if (isAccessExpiringSoon(30)) {
    try { await refreshAccessToken(); } catch {}
  }

  let headers = new Headers(init.headers || {});
  const token = getIdToken();
  // const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    // Try one refresh then retry once
    await refreshAccessToken();
    headers = new Headers(init.headers || {});
    const t2 = getIdToken();
    // const t2 = getAccessToken();
    if (t2) headers.set("Authorization", `Bearer ${t2}`);
    res = await fetch(input, { ...init, headers });
  }

  if (!autoJson) return res;
  // Throw on non-2xx to make error handling explicit
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with ${res.status}`);
  }
  return res.json();
}
