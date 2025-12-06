// lib/ws.ts
let ws: WebSocket | null = null;
let currentSessionId: string | null = null;
// const listeners = new Set<(msg: any) => void>();
const listeners = new Map<string, (msg: any) => void>();

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


  // Update onmessage to iterate Map values
  ws.onmessage = (evt) => {
    try {
      const msg = JSON.parse(evt.data as string);
      for (const fn of listeners.values()) fn(msg);
      console.log('[WS] message received');
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

// export function addListener(fn: (msg: any) => void) {
//   listeners.add(fn);
// }

export function addListener(fn: (msg: any) => void, key?: string) {
  if (key) {
    // If key provided, replace any existing listener with same key
    if (listeners.has(key)) {
      console.log(`[WS] Replacing existing listener: ${key}`);
    }
    listeners.set(key, fn);
    console.log(`[WS] Listener set for key: ${key}. Total: ${listeners.size}`);
  } else {
    // Fallback: anonymous listener (old behavior)
    listeners.set(fn.toString(), fn);
  }
}

// export function removeListener(fn: (msg: any) => void) {
//   listeners.delete(fn);
// }

export function removeListener(key: string) {
  const deleted = listeners.delete(key);
  console.log(`[WS] Listener removed: ${key}. Total: ${listeners.size}`);
  return deleted;
}

export function clearAllListeners() {
  listeners.clear();
  console.log('[WS] All listeners cleared');
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
    clearAllListeners()
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
