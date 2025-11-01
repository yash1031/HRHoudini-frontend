// lib/ws.ts
let ws: WebSocket | null = null;
let currentSessionId: string | null = null;
const listeners = new Set<(msg: any) => void>();

export function connectWebSocket(sessionId: string, userId: string | number | undefined) {
  const base = process.env.NEXT_PUBLIC_WS_URL;
  if (!base) {
    console.warn('NEXT_PUBLIC_WS_URL not set; skipping WS connect');
    return null;
  }

  // If already connected to the same session, reuse
  if (ws && currentSessionId === sessionId && ws.readyState === WebSocket.OPEN) {
    return ws;
  }

  // Close previous (if any)
  try { 
    if (!ws){
      console.log("No Previous web socket connection")
    }
    else{
      ws.close(); 
      ws.onclose = () => console.log('Previous [WS] disconnected');
    }
  } catch (error){
    console.error("Error disconnecting the current web sockets", error)
  }

  const url = `${base}?userId=${encodeURIComponent(String(userId ?? 'test'))}&sessionId=${encodeURIComponent(sessionId)}`;
  ws = new WebSocket(url);
  currentSessionId = sessionId;

  ws.onopen = () => {
    // @ts-ignore
    if (typeof window !== 'undefined') (window as any).__ws = ws; // for quick manual testing
    console.log('[WS] connected', { sessionId });
  };

  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data as string);
      for (const fn of listeners) fn(msg);
      console.log('[WS] message', msg);
    } catch {
      console.log('[WS] raw', evt.data);
    }
  };

  ws.onclose = () => {
    console.log('[WS] disconnected');
    ws = null;
    currentSessionId = null;
  };

  ws.onerror = (e) => {
    console.warn('[WS] error', e);
  };

  return ws;
}

export function addListener(fn: (msg: any) => void) {
  listeners.add(fn);
}

export function removeListener(fn: (msg: any) => void) {
  listeners.delete(fn);
}

export function getWebSocket(): WebSocket | null {
  return ws;
}

export function closeWebSocket() {
  try { 
    if (!ws){
      console.log("No connection to close")
      return;
    }
    ws.close(); 
    ws.onclose = () => console.log('Current [WS] disconnected');
  } catch (error){
    console.error("Error disconnecting current web sockets connection", error)
  }
  ws = null;
  currentSessionId = null;
}

export function send(data: any) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  ws.send(typeof data === 'string' ? data : JSON.stringify(data));
  return true;
}
