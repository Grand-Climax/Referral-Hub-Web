"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useMarkMessagesReadMutation,
  useSendMessageMutation,
} from "@/features/chat/chatApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useRealtime } from "@/context/RealtimeProvider";
import type { Conversation } from "@/types/realtime";

interface UseChatOptions {
  conversationId?: string | null;
  otherUserId?: string | null;
  referralId?: string | null;
}

export function useChat({
  conversationId,
  otherUserId,
  referralId,
}: UseChatOptions) {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { isConnected, setActiveConversationId } = useRealtime();
  const [page, setPage] = useState(1);
  const [resolvedConversation, setResolvedConversation] =
    useState<Conversation | null>(null);

  const messageParams = useMemo(() => {
    if (conversationId) {
      return { conversation_id: conversationId, page, limit: 30 };
    }
    if (otherUserId) {
      return {
        other_user_id: otherUserId,
        referral_id: referralId ?? undefined,
        page,
        limit: 30,
      };
    }
    return null;
  }, [conversationId, otherUserId, referralId, page]);

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

  const [sendMessageMutation, { isLoading: isSending }] =
    useSendMessageMutation();
  const [markRead] = useMarkMessagesReadMutation();
  const [fetchOlder] = useLazyGetMessagesQuery();

  const resolvedConvId =
    conversationId ?? messagesPage?.data[0]?.conversation_id ?? null;

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

  const hasMore =
    (messagesPage?.total ?? 0) > (messagesPage?.data.length ?? 0) &&
    page * 30 < (messagesPage?.total ?? 0);

  const fetchNextPage = useCallback(async () => {
    if (!messageParams || !hasMore) return;
    const nextPage = page + 1;
    await fetchOlder({ ...messageParams, page: nextPage }).unwrap();
    setPage(nextPage);
  }, [messageParams, hasMore, page, fetchOlder]);

  const sendMessage = useCallback(
    async (content: string) => {
      const recipientId =
        otherUserId ?? resolvedConversation?.other_user_id;
      if (!recipientId) {
        throw new Error("No recipient selected.");
      }
      return sendMessageMutation({
        receiver_id: recipientId,
        content,
        referral_id:
          referralId ?? resolvedConversation?.referral_id ?? null,
      }).unwrap();
    },
    [
      otherUserId,
      resolvedConversation,
      referralId,
      sendMessageMutation,
    ],
  );

  return {
    messages: messagesPage?.data ?? [],
    totalMessages: messagesPage?.total ?? 0,
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
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
