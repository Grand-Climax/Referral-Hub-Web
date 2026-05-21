"use client";

import { useState } from "react";
import {
  Bell,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/notificationsApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useNotificationsRealtime } from "@/context/NotificationProvider";
import {
  getNotificationsPagePath,
  getReferralDetailPath,
  isNotificationsEnabledForRole,
} from "@/lib/notificationRoutes";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/lib/utils";

type NotificationVisualType = "urgent" | "success" | "info" | "message" | "system";

function mapEventType(eventType: string): NotificationVisualType {
  const key = eventType.toUpperCase();
  if (
    key.includes("URGENT") ||
    key.includes("EMERGENCY") ||
    key.includes("CRITICAL") ||
    key.includes("REJECT")
  ) {
    return "urgent";
  }
  if (key.includes("ACCEPT") || key.includes("APPROV") || key.includes("COMPLETE")) {
    return "success";
  }
  if (key.includes("MESSAGE") || key.includes("CHAT") || key.includes("COMMENT")) {
    return "message";
  }
  if (key.includes("SCHEDULE") || key.includes("APPOINT") || key.includes("ARRIV")) {
    return "info";
  }
  return "system";
}

const getNotificationIcon = (type: NotificationVisualType) => {
  switch (type) {
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "info":
      return <Calendar className="h-4 w-4 text-blue-600" />;
    case "message":
      return <MessageSquare className="h-4 w-4 text-indigo-600" />;
    default:
      return <Bell className="h-4 w-4 text-slate-600" />;
  }
};

const getNotificationBg = (type: NotificationVisualType) => {
  switch (type) {
    case "urgent":
      return "bg-red-50 dark:bg-red-900/20";
    case "success":
      return "bg-green-50 dark:bg-green-900/20";
    case "info":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "message":
      return "bg-indigo-50 dark:bg-indigo-900/20";
    default:
      return "bg-slate-50 dark:bg-slate-900/20";
  }
};

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { data: user } = useGetCurrentUserQuery();
  const notificationsEnabled = isNotificationsEnabledForRole(user?.role);
  const { isConnected, isReconnecting } = useNotificationsRealtime();

  const { data: unreadCount = 0 } = useGetUnreadNotificationCountQuery(undefined, {
    skip: !user || !notificationsEnabled,
  });

  const {
    data: notificationsPage,
    isLoading,
    isFetching,
  } = useGetNotificationsQuery(
    { page: 1, page_size: 15 },
    { skip: !isOpen || !user || !notificationsEnabled },
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const notifications = notificationsPage?.data ?? [];
  const viewAllPath = getNotificationsPagePath(user?.role);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not mark all notifications as read.");
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        await markRead(notification.id).unwrap();
      } catch {
        toast.error("Could not mark notification as read.");
      }
    }

    if (notification.referral_id) {
      const path = getReferralDetailPath(user?.role, notification.referral_id);
      if (path) {
        setIsOpen(false);
        router.push(path);
      }
    }
  };

  const connectionLabel = isConnected
    ? "Live"
    : isReconnecting
      ? "Reconnecting"
      : "Polling";

  const connectionClass = isConnected
    ? "bg-emerald-500"
    : isReconnecting
      ? "bg-amber-500 animate-pulse"
      : "bg-rose-500";

  if (!notificationsEnabled) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setIsOpen(false)}
          />

          <Card className="absolute right-0 mt-4 w-[380px] z-50 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Notifications
                </CardTitle>
                {unreadCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold scale-90"
                  >
                    {unreadCount} NEW
                  </Badge>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white",
                    connectionClass,
                  )}
                  title={connectionLabel}
                >
                  {connectionLabel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                  title="Mark all as read"
                  disabled={isMarkingAll || unreadCount === 0}
                  onClick={() => {
                    void handleMarkAllRead();
                  }}
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[450px]">
                {isLoading || isFetching ? (
                  <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.map((notification) => {
                      const visualType = mapEventType(notification.event_type);
                      const createdAt = notification.created_at
                        ? new Date(notification.created_at)
                        : new Date();

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            void handleNotificationClick(notification);
                          }}
                          className={cn(
                            "relative flex w-full items-start gap-4 p-5 text-left transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/50",
                            !notification.is_read &&
                              "bg-blue-50/30 dark:bg-blue-900/5",
                          )}
                        >
                          {!notification.is_read && (
                            <span className="absolute left-2 top-6 h-1.5 w-1.5 rounded-full bg-blue-600" />
                          )}

                          <div
                            className={cn(
                              "mt-1 h-9 w-9 flex items-center justify-center rounded-xl shrink-0 shadow-sm",
                              getNotificationBg(visualType),
                            )}
                          >
                            {getNotificationIcon(visualType)}
                          </div>

                          <div className="flex-1 space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm font-bold leading-none truncate",
                                  !notification.is_read
                                    ? "text-slate-950 dark:text-slate-50"
                                    : "text-slate-600 dark:text-slate-400",
                                )}
                              >
                                {notification.title}
                              </p>
                              <span className="text-[10px] font-medium text-slate-400 shrink-0">
                                {formatDistanceToNow(createdAt, {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p
                              className={cn(
                                "text-xs leading-relaxed line-clamp-2",
                                !notification.is_read
                                  ? "text-slate-700 dark:text-slate-300"
                                  : "text-slate-500",
                              )}
                            >
                              {notification.message}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
                <Link
                  href={viewAllPath}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  VIEW ALL NOTIFICATIONS
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
