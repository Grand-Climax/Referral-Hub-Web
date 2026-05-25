"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useMarkMessagesReadMutation,
} from "@/features/chat/chatApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useRealtime } from "@/context/RealtimeProvider";
import type { ChatMessage, Conversation } from "@/types/realtime";

interface UseChatOptions {
  conversationId?: string | null;
  otherUserId?: string | null;
  referralId?: string | null;
}

function mergeMessages(
  older: ChatMessage[],
  current: ChatMessage[],
  pending: ChatMessage[],
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const msg of [...older, ...current, ...pending]) {
    if (!byId.has(msg.id)) byId.set(msg.id, msg);
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function useChat({
  conversationId,
  otherUserId,
  referralId,
}: UseChatOptions) {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { isConnected, setActiveConversationId, sendChatMessage } =
    useRealtime();
  const [historyPage, setHistoryPage] = useState(1);
  const [olderMessages, setOlderMessages] = useState<ChatMessage[]>([]);
  const [pendingMessages, setPendingMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [resolvedConversation, setResolvedConversation] =
    useState<Conversation | null>(null);

  const messageParams = useMemo(() => {
    if (conversationId) {
      return { conversation_id: conversationId, page: 1, limit: 30 };
    }
    if (otherUserId) {
      return {
        other_user_id: otherUserId,
        referral_id: referralId ?? undefined,
        page: 1,
        limit: 30,
      };
    }
    return null;
  }, [conversationId, otherUserId, referralId]);

  const {
    data: messagesPage,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetMessagesQuery(messageParams!, {
    skip: !messageParams,
  });

  const { data: conversationsPage } = useGetConversationsQuery({
    page: 1,
    limit: 100,
  });

  const [markRead] = useMarkMessagesReadMutation();
  const [fetchOlder, { isFetching: isFetchingOlder }] = useLazyGetMessagesQuery();

  const resolvedConvId =
    conversationId ?? messagesPage?.data[0]?.conversation_id ?? null;

  useEffect(() => {
    setHistoryPage(1);
    setOlderMessages([]);
    setPendingMessages([]);
  }, [conversationId, otherUserId, referralId]);

  useEffect(() => {
    setActiveConversationId(resolvedConvId);
    return () => setActiveConversationId(null);
  }, [resolvedConvId, setActiveConversationId]);

  useEffect(() => {
    if (!resolvedConvId || !conversationsPage?.data) return;
    const found = conversationsPage.data.find(
      (c) => c.conversation_id === resolvedConvId,
    );
    if (found) setResolvedConversation(found);
  }, [resolvedConvId, conversationsPage]);

  useEffect(() => {
    if (resolvedConvId) {
      markRead({ conversation_id: resolvedConvId }).catch(() => {});
    }
  }, [resolvedConvId, markRead, messagesPage?.data.length]);

  const latestPage = messagesPage?.data ?? [];
  const totalMessages = messagesPage?.total ?? 0;
  const loadedCount = olderMessages.length + latestPage.length;
  const hasMore = totalMessages > loadedCount;

  const messages = useMemo(
    () => mergeMessages(olderMessages, latestPage, pendingMessages),
    [olderMessages, latestPage, pendingMessages],
  );

  const fetchNextPage = useCallback(async () => {
    if (!messageParams || !hasMore || isFetchingOlder) return;
    const nextPage = historyPage + 1;
    const result = await fetchOlder({ ...messageParams, page: nextPage }).unwrap();
    setOlderMessages((prev) => {
      const merged = mergeMessages(result.data, prev, []);
      return merged.filter((m) => !latestPage.some((n) => n.id === m.id));
    });
    setHistoryPage(nextPage);
  }, [
    messageParams,
    hasMore,
    isFetchingOlder,
    historyPage,
    fetchOlder,
    latestPage,
  ]);

  const sendMessage = useCallback(
    async (content: string) => {
      const recipientId =
        otherUserId ?? resolvedConversation?.other_user_id;
      if (!recipientId) {
        throw new Error("No recipient selected.");
      }

      const effectiveReferralId =
        referralId ?? resolvedConversation?.referral_id ?? null;

      const optimisticId = `optimistic-${Date.now()}`;
      const optimistic: ChatMessage = {
        id: optimisticId,
        conversation_id: resolvedConvId ?? "",
        referral_id: effectiveReferralId,
        type: effectiveReferralId ? "referral" : "direct",
        sender_id: currentUser?.id ?? "",
        sender_name: currentUser
          ? `${currentUser.first_name ?? ""} ${currentUser.last_name ?? ""}`.trim()
          : undefined,
        receiver_id: recipientId,
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      setPendingMessages((prev) => [...prev, optimistic]);
      setIsSending(true);

      try {
        const confirmed = await sendChatMessage(
          recipientId,
          content,
          effectiveReferralId,
        );
        setPendingMessages((prev) => {
          const without = prev.filter((m) => m.id !== optimisticId);
          if (confirmed) return [...without, confirmed];
          return without;
        });
        return confirmed ?? optimistic;
      } catch (error) {
        setPendingMessages((prev) =>
          prev.filter((m) => m.id !== optimisticId),
        );
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [
      otherUserId,
      resolvedConversation,
      referralId,
      sendChatMessage,
      resolvedConvId,
      currentUser,
    ],
  );

  return {
    messages,
    totalMessages,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages || isFetchingOlder,
    hasMore,
    fetchNextPage,
    sendMessage,
    isSending,
    isReadOnly: resolvedConversation?.is_read_only ?? false,
    isDisabled: resolvedConversation?.is_disabled ?? false,
    disabledReason: resolvedConversation?.disabled_reason ?? "",
    isWsConnected: isConnected,
    resolvedConversation,
    currentUserId: currentUser?.id ?? "",
    conversationId: resolvedConvId,
  };
}
