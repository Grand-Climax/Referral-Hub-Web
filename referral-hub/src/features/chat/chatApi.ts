import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { CHAT_ROUTES } from "@/config/api";
import type {
  ChatMessage,
  ChatUnreadCountResponse,
  Conversation,
  ConversationsListResponse,
  MarkMessagesReadRequest,
  MessagesListResponse,
  SendMessageRequest,
  SendMessageResponse,
} from "@/types/realtime";

export interface ConversationsPageResult {
  data: Conversation[];
  total: number;
  page: number;
  page_size: number;
}

export interface MessagesPageResult {
  data: ChatMessage[];
  total: number;
  page: number;
  page_size: number;
}

export interface GetMessagesParams {
  conversation_id?: string;
  other_user_id?: string;
  referral_id?: string;
  page?: number;
  limit?: number;
}

function normalizeConversations(
  raw: ConversationsListResponse | unknown,
): ConversationsPageResult {
  if (raw && typeof raw === "object") {
    const payload = raw as ConversationsListResponse;
    const data = Array.isArray(payload.data) ? payload.data : [];
    return {
      data,
      total: Number(payload.total ?? data.length),
      page: Number(payload.page ?? 1),
      page_size: Number(payload.page_size ?? data.length),
    };
  }
  return { data: [], total: 0, page: 1, page_size: 20 };
}

function normalizeMessages(
  raw: MessagesListResponse | unknown,
): MessagesPageResult {
  if (raw && typeof raw === "object") {
    const payload = raw as MessagesListResponse;
    const data = Array.isArray(payload.data) ? payload.data : [];
    return {
      data,
      total: Number(payload.total ?? data.length),
      page: Number(payload.page ?? 1),
      page_size: Number(payload.page_size ?? data.length),
    };
  }
  return { data: [], total: 0, page: 1, page_size: 30 };
}

function parseSendMessageResponse(raw: SendMessageResponse): ChatMessage {
  return {
    id: raw.id,
    conversation_id: raw.conversation_id,
    referral_id: raw.referral_id ?? null,
    sender_id: raw.sender_id,
    receiver_id: raw.receiver_id,
    content: raw.content,
    created_at: raw.created_at,
  };
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Conversation", "ChatMessage", "ChatUnread"],
  endpoints: (builder) => ({
    getConversations: builder.query<
      ConversationsPageResult,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: CHAT_ROUTES.CONVERSATIONS,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
        },
      }),
      transformResponse: (raw: ConversationsListResponse) =>
        normalizeConversations(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ conversation_id }) => ({
                type: "Conversation" as const,
                id: conversation_id,
              })),
              { type: "Conversation" as const, id: "LIST" },
            ]
          : [{ type: "Conversation" as const, id: "LIST" }],
    }),
    getMessages: builder.query<MessagesPageResult, GetMessagesParams>({
      query: (params) => {
        const queryParams: Record<string, string | number> = {
          page: params.page ?? 1,
          limit: params.limit ?? 30,
        };
        if (params.conversation_id) {
          queryParams.conversation_id = params.conversation_id;
        }
        if (params.other_user_id) {
          queryParams.other_user_id = params.other_user_id;
        }
        if (params.referral_id) {
          queryParams.referral_id = params.referral_id;
        }
        return {
          url: CHAT_ROUTES.MESSAGES,
          method: "GET",
          params: queryParams,
        };
      },
      transformResponse: (raw: MessagesListResponse) => normalizeMessages(raw),
      providesTags: (result, _err, params) => {
        const listId =
          params.conversation_id ??
          (params.other_user_id
            ? `user-${params.other_user_id}${params.referral_id ? `-${params.referral_id}` : ""}`
            : "unknown");
        return result
          ? [
              ...result.data.map(({ id }) => ({
                type: "ChatMessage" as const,
                id,
              })),
              { type: "ChatMessage" as const, id: listId },
            ]
          : [{ type: "ChatMessage" as const, id: listId }];
      },
    }),
    sendMessage: builder.mutation<ChatMessage, SendMessageRequest>({
      query: (body) => ({
        url: CHAT_ROUTES.MESSAGES,
        method: "POST",
        body: {
          receiver_id: body.receiver_id,
          content: body.content.trim(),
          referral_id: body.referral_id ?? null,
        },
      }),
      transformResponse: (raw: SendMessageResponse) =>
        parseSendMessageResponse(raw),
      invalidatesTags: [
        { type: "Conversation", id: "LIST" },
        { type: "ChatUnread", id: "COUNT" },
      ],
    }),
    markMessagesRead: builder.mutation<void, MarkMessagesReadRequest>({
      query: (body) => ({
        url: CHAT_ROUTES.MESSAGES_READ,
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Conversation", id: "LIST" },
        { type: "ChatUnread", id: "COUNT" },
      ],
    }),
    getChatUnreadCount: builder.query<number, void>({
      query: () => ({
        url: CHAT_ROUTES.UNREAD_COUNT,
        method: "GET",
      }),
      transformResponse: (raw: ChatUnreadCountResponse) =>
        Number(raw?.unread_count ?? 0),
      providesTags: [{ type: "ChatUnread", id: "COUNT" }],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesReadMutation,
  useGetChatUnreadCountQuery,
  useLazyGetMessagesQuery,
} = chatApi;
