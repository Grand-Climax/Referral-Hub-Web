"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import {
  isWSNotificationFrame,
  type WSIncomingNotificationEnvelope,
} from "@/types/notification";
import { notificationsApi } from "@/features/notifications/notificationsApi";
import { useAppDispatch } from "@/lib/store/hooks";
import type { AppDispatch } from "@/lib/store/index";
import { buildWebSocketUrl } from "@/lib/websocketUrl";

const RECOVERY_POLL_INTERVAL = 25000;

interface NotificationRealtimeContextType {
  isConnected: boolean;
  isReconnecting: boolean;
}

const NotificationRealtimeContext = createContext<
  NotificationRealtimeContextType | undefined
>(undefined);

const URGENT_EVENT_TYPES = new Set([
  "URGENT",
  "EMERGENCY",
  "CRITICAL",
  "REFERRAL_URGENT",
  "REFERRAL_EMERGENCY",
]);

function invalidateNotificationCaches(dispatch: AppDispatch) {
  dispatch(
    notificationsApi.util.invalidateTags([
      { type: "Notification", id: "LIST" },
      { type: "Notification", id: "UNREAD" },
    ]),
  );
}

export function NotificationProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isConnectedRef = useRef(false);
  const isReconnectingRef = useRef(false);
  const connectWSRef = useRef<() => void>(() => {});
  const disconnectWSRef = useRef<() => void>(() => {});

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isReconnectingRef.current = isReconnecting;
  }, [isReconnecting]);

  const disconnectWS = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.onmessage = null;
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
    if (watchdogTimeoutRef.current) clearTimeout(watchdogTimeoutRef.current);
  }, []);

  const syncUnreadCount = useCallback(() => {
    if (!token) return;
    invalidateNotificationCaches(dispatch);
  }, [token, dispatch]);

  const startFallbackPolling = useCallback(() => {
    if (fallbackPollIntervalRef.current) {
      clearInterval(fallbackPollIntervalRef.current);
    }
    fallbackPollIntervalRef.current = setInterval(() => {
      syncUnreadCount();
    }, RECOVERY_POLL_INTERVAL);
  }, [syncUnreadCount]);

  const resetWatchdog = useCallback(() => {
    if (watchdogTimeoutRef.current) clearTimeout(watchdogTimeoutRef.current);
    watchdogTimeoutRef.current = setTimeout(() => {
      disconnectWSRef.current();
      connectWSRef.current();
    }, 65000);
  }, []);

  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    setIsReconnecting(true);

    const baseDelay = 1000;
    const maxDelay = 16000;
    const attempts = reconnectAttemptRef.current;
    const delay =
      Math.min(maxDelay, baseDelay * Math.pow(2, attempts)) +
      Math.random() * 500;
    reconnectAttemptRef.current = attempts + 1;

    reconnectTimeoutRef.current = setTimeout(() => {
      connectWSRef.current();
    }, delay);

    if (attempts >= 3 && !fallbackPollIntervalRef.current) {
      startFallbackPolling();
    }
  }, [startFallbackPolling]);

  const connectWS = useCallback(() => {
    if (!token || typeof window === "undefined") return;

    disconnectWS();

    const wsUrl = buildWebSocketUrl(token);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      reconnectAttemptRef.current = 0;
      resetWatchdog();
      syncUnreadCount();

      if (fallbackPollIntervalRef.current) {
        clearInterval(fallbackPollIntervalRef.current);
        fallbackPollIntervalRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      resetWatchdog();
      try {
        const envelope = JSON.parse(event.data) as WSIncomingNotificationEnvelope;

        if (isWSNotificationFrame(envelope)) {
          invalidateNotificationCaches(dispatch);

          const { data } = envelope;
          const eventType = data.event_type?.toUpperCase() ?? "";
          if (URGENT_EVENT_TYPES.has(eventType)) {
            toast(data.title, {
              description: data.message,
            });
          }
        } else if (envelope.type === "error" && envelope.data) {
          const errData = envelope.data as { message?: string };
          console.error("[WS] Error frame:", errData.message);
        }
      } catch (err) {
        console.error("[WS] Failed to parse notification frame:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Connection error:", err);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      if (watchdogTimeoutRef.current) clearTimeout(watchdogTimeoutRef.current);

      if (
        event.code === 4001 ||
        event.reason === "invalid token" ||
        event.code === 1008
      ) {
        return;
      }

      scheduleReconnection();
    };
  }, [
    token,
    disconnectWS,
    resetWatchdog,
    syncUnreadCount,
    scheduleReconnection,
    dispatch,
  ]);

  useEffect(() => {
    connectWSRef.current = connectWS;
    disconnectWSRef.current = disconnectWS;
  }, [connectWS, disconnectWS]);

  useEffect(() => {
    if (!token) {
      disconnectWS();
      if (fallbackPollIntervalRef.current) {
        clearInterval(fallbackPollIntervalRef.current);
        fallbackPollIntervalRef.current = null;
      }
      return;
    }

    connectWS();

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        !isConnectedRef.current &&
        !isReconnectingRef.current
      ) {
        reconnectAttemptRef.current = 0;
        connectWS();
      }
    };

    const handleOnline = () => {
      reconnectAttemptRef.current = 0;
      connectWS();
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disconnectWS();
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (fallbackPollIntervalRef.current) {
        clearInterval(fallbackPollIntervalRef.current);
      }
    };
  }, [token, connectWS, disconnectWS]);

  return (
    <NotificationRealtimeContext.Provider
      value={{ isConnected, isReconnecting }}
    >
      {children}
    </NotificationRealtimeContext.Provider>
  );
}

export function useNotificationsRealtime() {
  const context = useContext(NotificationRealtimeContext);
  if (!context) {
    return { isConnected: false, isReconnecting: false };
  }
  return context;
}
