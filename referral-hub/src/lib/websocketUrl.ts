/**
 * Resolves the WebSocket base URL for real-time notifications.
 * Prefer NEXT_PUBLIC_WS_URL; otherwise derive from NEXT_PUBLIC_API_URL so
 * WS and REST hit the same backend (avoids broken Next.js /ws proxy on :8080).
 */
export function getWebSocketBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
      const path = parsed.pathname.replace(/\/$/, "");
      const base = `${wsProtocol}//${parsed.host}${path}`;
      return base.endsWith("/ws") ? base : `${base}/ws`;
    } catch {
      // fall through
    }
  }

  if (typeof window !== "undefined") {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.host}/ws`;
  }

  return "ws://localhost:8000/ws";
}

export function buildWebSocketUrl(token: string): string {
  const base = getWebSocketBaseUrl();
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}token=${encodeURIComponent(token)}`;
}
