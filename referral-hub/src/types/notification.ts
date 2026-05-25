export interface AppNotification {
  id: string;
  referral_id?: string | null;
  title: string;
  message: string;
  event_type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsListResponse {
  success?: boolean;
  message?: string;
  data?: AppNotification[];
  total?: number;
  unread_count?: number;
  page?: number;
  page_size?: number;
}

export interface NotificationsUnreadCountResponse {
  success?: boolean;
  unread_count?: number;
}

export interface NotificationsQueryParams {
  page?: number;
  page_size?: number;
  event_type?: string;
  is_read?: boolean;
  referral_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface NotificationsPageResult {
  data: AppNotification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export interface WSWebSocketNotification {
  id: string;
  title: string;
  message: string;
  event_type: string;
  referral_id?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface WSOutboundNotificationFrame {
  type: "notification";
  data: WSWebSocketNotification;
}

export interface WSOutboundErrorFrame {
  type: "error";
  data: { message: string };
}

export type WSIncomingNotificationEnvelope =
  | WSOutboundNotificationFrame
  | WSOutboundErrorFrame;

export function isWSNotificationFrame(
  envelope: WSIncomingNotificationEnvelope,
): envelope is WSOutboundNotificationFrame {
  return envelope.type === "notification";
}
