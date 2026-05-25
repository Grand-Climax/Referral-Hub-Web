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
  isWSChatFrame,
  type ChatMessage,
  type WSInboundChatFrame,
  type WSIncomingRealtimeEnvelope,
} from "@/types/realtime";
import {
  isWSNotificationFrame,
} from "@/types/notification";
import { notificationsApi } from "@/features/notifications/notificationsApi";
import { chatApi } from "@/features/chat/chatApi";
import { useAppDispatch } from "@/lib/store/hooks";
import type { AppDispatch } from "@/lib/store/index";
import { buildWebSocketUrl } from "@/lib/websocketUrl";

const RECOVERY_POLL_INTERVAL = 25000;

const URGENT_EVENT_TYPES = new Set([
  "URGENT",
  "EMERGENCY",
  "CRITICAL",
  "REFERRAL_URGENT",
  "REFERRAL_EMERGENCY",
]);

interface RealtimeContextType {
  isConnected: boolean;
  isReconnecting: boolean;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  /** WebSocket-first send; REST fallback when socket is offline. */
  sendChatMessage: (
    receiverId: string,
    content: string,
    referralId: string | null,
  ) => Promise<ChatMessage | null>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined,
);

function invalidateNotificationCaches(dispatch: AppDispatch) {
  dispatch(
    notificationsApi.util.invalidateTags([
      { type: "Notification", id: "LIST" },
      { type: "Notification", id: "UNREAD" },
    ]),
  );
}

function invalidateChatCaches(
  dispatch: AppDispatch,
  conversationId?: string,
) {
  dispatch(
    chatApi.util.invalidateTags([
      { type: "Conversation", id: "LIST" },
      { type: "ChatUnread", id: "COUNT" },
      ...(conversationId
        ? [
            { type: "ChatMessage" as const, id: conversationId },
            { type: "Conversation" as const, id: conversationId },
          ]
        : []),
    ]),
  );
}

export function RealtimeProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null,
  );

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isConnectedRef = useRef(false);
  const isReconnectingRef = useRef(false);
  const activeConversationIdRef = useRef<string | null>(null);
  const connectWSRef = useRef<() => void>(() => {});
  const disconnectWSRef = useRef<() => void>(() => {});

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isReconnectingRef.current = isReconnecting;
  }, [isReconnecting]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

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

  const syncState = useCallback(() => {
    if (!token) return;
    invalidateNotificationCaches(dispatch);
    invalidateChatCaches(dispatch);
  }, [token, dispatch]);

  const startFallbackPolling = useCallback(() => {
    if (fallbackPollIntervalRef.current) {
      clearInterval(fallbackPollIntervalRef.current);
    }
    fallbackPollIntervalRef.current = setInterval(() => {
      syncState();
    }, RECOVERY_POLL_INTERVAL);
  }, [syncState]);

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
      syncState();

      if (fallbackPollIntervalRef.current) {
        clearInterval(fallbackPollIntervalRef.current);
        fallbackPollIntervalRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      resetWatchdog();
      try {
        const envelope = JSON.parse(event.data) as WSIncomingRealtimeEnvelope;

        if (isWSChatFrame(envelope)) {
          const chatMsg = envelope.data;
          const currentActiveId = activeConversationIdRef.current;

          if (currentActiveId === chatMsg.conversation_id) {
            invalidateChatCaches(dispatch, chatMsg.conversation_id);
            dispatch(
              chatApi.endpoints.markMessagesRead.initiate({
                conversation_id: chatMsg.conversation_id,
              }),
            );
          } else {
            invalidateChatCaches(dispatch);
            toast("New message", {
              description:
                chatMsg.content.length > 80
                  ? `${chatMsg.content.slice(0, 80)}…`
                  : chatMsg.content,
            });
          }
        } else if (isWSNotificationFrame(envelope)) {
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
        console.error("[WS] Failed to parse WebSocket frame:", err);
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
    syncState,
    scheduleReconnection,
    dispatch,
  ]);

  const sendChatMessage = useCallback(
    async (
      receiverId: string,
      content: string,
      referralId: string | null,
    ): Promise<ChatMessage | null> => {
      const trimmed = content.trim();
      if (trimmed.length === 0 || trimmed.length > 5000) {
        throw new Error("Message must be between 1 and 5000 characters.");
      }

      const frame: WSInboundChatFrame = {
        type: "chat",
        receiver_id: receiverId,
        referral_id: referralId,
        content: trimmed,
      };

      const ws = socketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(frame));
          invalidateChatCaches(dispatch, activeConversationIdRef.current ?? undefined);
          return null;
        } catch (wsErr) {
          console.warn("[WS] Send failed, using REST fallback:", wsErr);
        }
      }

      const result = await dispatch(
        chatApi.endpoints.sendMessage.initiate({
          receiver_id: receiverId,
          content: trimmed,
          referral_id: referralId,
        }),
      ).unwrap();

      invalidateChatCaches(dispatch, result.conversation_id);
      return result;
    },
    [dispatch],
  );

  useEffect(() => {
    connectWSRef.current = connectWS;
    disconnectWSRef.current = disconnectWS;
  }, [connectWS, disconnectWS]);

  useEffect(() => {
    if (!token) {
      disconnectWS();
      setActiveConversationId(null);
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
      setActiveConversationId(null);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (fallbackPollIntervalRef.current) {
        clearInterval(fallbackPollIntervalRef.current);
      }
    };
  }, [token, connectWS, disconnectWS]);

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        isReconnecting,
        activeConversationId,
        setActiveConversationId,
        sendChatMessage,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    return {
      isConnected: false,
      isReconnecting: false,
      activeConversationId: null,
      setActiveConversationId: () => {},
      sendChatMessage: async () => {
        throw new Error("RealtimeProvider is not mounted.");
      },
    };
  }
  return context;
}

/** @deprecated Use useRealtime */
export function useNotificationsRealtime() {
  const { isConnected, isReconnecting } = useRealtime();
  return { isConnected, isReconnecting };
}

/** @deprecated Use RealtimeProvider */
export const NotificationProvider = RealtimeProvider;
