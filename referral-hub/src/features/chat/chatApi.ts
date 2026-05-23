import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { CHAT_ROUTES } from "@/config/api";
import {
  parseSendMessageResponse,
  type ChatContact,
  type ChatMessage,
  type ChatUnreadCountResponse,
  type ContactsListResponse,
  type Conversation,
  type ConversationsListResponse,
  type MarkMessagesReadRequest,
  type MessagesListResponse,
  type SendMessageRequest,
  type SendMessageResponse,
  type ToggleConversationDisabledRequest,
} from "@/types/realtime";

export type ConversationListFilter = "all" | "direct" | "referral";

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

export interface ContactsPageResult {
  data: ChatContact[];
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

export interface GetContactsParams {
  referral_id?: string;
  search?: string;
  role?: string;
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

function normalizeContacts(
  raw: ContactsListResponse | unknown,
): ContactsPageResult {
  if (raw && typeof raw === "object") {
    const payload = raw as ContactsListResponse;
    const data = Array.isArray(payload.data) ? payload.data : [];
    return {
      data,
      total: Number(payload.total ?? data.length),
      page: Number(payload.page ?? 1),
      page_size: Number(payload.page_size ?? data.length),
    };
  }
  return { data: [], total: 0, page: 1, page_size: 50 };
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Conversation", "ChatMessage", "ChatUnread", "ChatContact"],
  endpoints: (builder) => ({
    getConversations: builder.query<
      ConversationsPageResult,
      { page?: number; limit?: number; type?: ConversationListFilter } | void
    >({
      query: (params) => ({
        url: CHAT_ROUTES.CONVERSATIONS,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.type && params.type !== "all"
            ? { type: params.type }
            : {}),
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
    getContacts: builder.query<ContactsPageResult, GetContactsParams | void>({
      query: (params) => ({
        url: CHAT_ROUTES.CONTACTS,
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 50,
          ...(params?.referral_id ? { referral_id: params.referral_id } : {}),
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.role ? { role: params.role } : {}),
        },
      }),
      transformResponse: (raw: ContactsListResponse) => normalizeContacts(raw),
      providesTags: [{ type: "ChatContact", id: "LIST" }],
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
    toggleConversationDisabled: builder.mutation<
      void,
      { conversationId: string; body: ToggleConversationDisabledRequest }
    >({
      query: ({ conversationId, body }) => ({
        url: CHAT_ROUTES.TOGGLE_DISABLED(conversationId),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: "Conversation", id: conversationId },
        { type: "Conversation", id: "LIST" },
      ],
    }),
    deleteConversation: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: CHAT_ROUTES.DELETE_CONVERSATION(conversationId),
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Conversation", id: "LIST" },
        { type: "ChatUnread", id: "COUNT" },
      ],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetContactsQuery,
  useLazyGetContactsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesReadMutation,
  useGetChatUnreadCountQuery,
  useLazyGetMessagesQuery,
  useToggleConversationDisabledMutation,
  useDeleteConversationMutation,
} = chatApi;
