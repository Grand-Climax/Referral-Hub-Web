export interface ChatMessage {
  id: string;
  conversation_id: string;
  referral_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_role: string;
  other_user_hospital: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  referral_id: string | null;
  is_read_only: boolean;
  is_disabled: boolean;
  disabled_reason?: string;
}

export interface ConversationsListResponse {
  success?: boolean;
  message?: string;
  data?: Conversation[];
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

/** Flat spread response from POST /chat/messages */
export interface SendMessageResponse extends ChatMessage {
  success?: boolean;
  message?: string;
}

export interface ChatUnreadCountResponse {
  success?: boolean;
  unread_count?: number;
}

export interface MarkMessagesReadRequest {
  conversation_id: string;
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
