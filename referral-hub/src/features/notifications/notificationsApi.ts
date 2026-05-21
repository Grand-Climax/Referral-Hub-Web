import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { NOTIFICATION_ROUTES } from "@/config/api";
import type {
  AppNotification,
  NotificationsListResponse,
  NotificationsPageResult,
  NotificationsQueryParams,
  NotificationsUnreadCountResponse,
} from "@/types/notification";

function normalizeNotificationsPage(
  raw: NotificationsListResponse | unknown,
): NotificationsPageResult {
  if (raw && typeof raw === "object") {
    const payload = raw as NotificationsListResponse;
    const data = Array.isArray(payload.data) ? payload.data : [];
    return {
      data,
      total: Number(payload.total ?? data.length),
      unread_count: Number(payload.unread_count ?? 0),
      page: Number(payload.page ?? 1),
      page_size: Number(payload.page_size ?? data.length),
    };
  }
  return { data: [], total: 0, unread_count: 0, page: 1, page_size: 10 };
}

function normalizeUnreadCount(
  raw: NotificationsUnreadCountResponse | unknown,
): number {
  if (raw && typeof raw === "object" && "unread_count" in raw) {
    return Number((raw as NotificationsUnreadCountResponse).unread_count ?? 0);
  }
  return 0;
}

export const notificationsApi = createApi({
  reducerPath: "notificationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsPageResult,
      NotificationsQueryParams | void
    >({
      query: (params) => {
        const queryParams: Record<string, string | number | boolean> = {};
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null || value === "") continue;
            queryParams[key] = value as string | number | boolean;
          }
        }
        return {
          url: NOTIFICATION_ROUTES.LIST,
          method: "GET",
          params:
            Object.keys(queryParams).length > 0 ? queryParams : undefined,
        };
      },
      transformResponse: (raw: NotificationsListResponse) =>
        normalizeNotificationsPage(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Notification" as const,
                id,
              })),
              { type: "Notification" as const, id: "LIST" },
            ]
          : [{ type: "Notification" as const, id: "LIST" }],
    }),
    getUnreadNotificationCount: builder.query<number, void>({
      query: () => ({
        url: NOTIFICATION_ROUTES.UNREAD_COUNT,
        method: "GET",
      }),
      transformResponse: (raw: NotificationsUnreadCountResponse) =>
        normalizeUnreadCount(raw),
      providesTags: [{ type: "Notification", id: "UNREAD" }],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({
        url: NOTIFICATION_ROUTES.READ(id),
        method: "POST",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD" },
      ],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: NOTIFICATION_ROUTES.READ_ALL,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Notification", id: "LIST" },
        { type: "Notification", id: "UNREAD" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;

export type { AppNotification };
