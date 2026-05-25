export type ChatConversationType = "direct" | "referral";

export interface ChatMessage {
  id: string;
  conversation_id: string;
  referral_id: string | null;
  type?: ChatConversationType;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  conversation_id: string;
  type: ChatConversationType;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  other_user_hospital: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  referral_id: string | null;
  referral_status?: string | null;
  is_read_only: boolean;
  is_disabled: boolean;
  disabled_reason?: string;
}

export interface ChatContact {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  hospital_name: string;
  department_name?: string;
}

export interface ConversationsListResponse {
  success?: boolean;
  message?: string;
  data?: Conversation[];
  total?: number;
  page?: number;
  page_size?: number;
}

export interface ContactsListResponse {
  success?: boolean;
  message?: string;
  data?: ChatContact[];
  total?: number;
  page?: number;
  page_size?: number;
}

export interface MessagesListResponse {
  success?: boolean;
  message?: string;
  data?: ChatMessage[];
  total?: number;
  page?: number;
  page_size?: number;
}

export interface SendMessageRequest {
  receiver_id: string;
  content: string;
  referral_id?: string | null;
}

/** Flat spread response from POST /chat/messages (no nested `data` key). */
export interface SendMessageResponse {
  success?: boolean;
  message?: string;
  id: string;
  conversation_id: string;
  referral_id: string | null;
  type?: ChatConversationType;
  sender_id: string;
  sender_name?: string;
  sender_role?: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface ChatUnreadCountResponse {
  success?: boolean;
  unread_count?: number;
}

export interface MarkMessagesReadRequest {
  conversation_id: string;
}

export interface ToggleConversationDisabledRequest {
  is_disabled: boolean;
  reason: string;
}

export interface WSInboundChatFrame {
  type: "chat";
  receiver_id: string;
  referral_id: string | null;
  content: string;
}

export interface WSOutboundMessageFrame {
  type: "chat";
  data: ChatMessage;
}

export interface WSOutboundErrorFrame {
  type: "error";
  data: { message: string };
}

export type WSIncomingRealtimeEnvelope =
  | WSOutboundMessageFrame
  | import("@/types/notification").WSOutboundNotificationFrame
  | WSOutboundErrorFrame;

export function isWSChatFrame(
  envelope: { type: string },
): envelope is WSOutboundMessageFrame {
  return envelope.type === "chat";
}

export function parseSendMessageResponse(raw: SendMessageResponse): ChatMessage {
  return {
    id: raw.id,
    conversation_id: raw.conversation_id,
    referral_id: raw.referral_id ?? null,
    type: raw.type,
    sender_id: raw.sender_id,
    sender_name: raw.sender_name,
    sender_role: raw.sender_role,
    receiver_id: raw.receiver_id,
    content: raw.content,
    created_at: raw.created_at,
  };
}
