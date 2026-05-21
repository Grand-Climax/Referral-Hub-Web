"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  Loader2,
  RefreshCcw,
  Search,

} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/features/notifications/notificationsApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { getReferralDetailPath } from "@/lib/notificationRoutes";
import type { AppNotification } from "@/types/notification";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const EVENT_TYPE_OPTIONS = [
  { value: "all", label: "All event types" },
  { value: "REFERRAL_CREATED", label: "Referral created" },
  { value: "REFERRAL_ACCEPTED", label: "Referral accepted" },
  { value: "REFERRAL_REJECTED", label: "Referral rejected" },
  { value: "REFERRAL_COMPLETED", label: "Referral completed" },
  { value: "REFERRAL_URGENT", label: "Urgent referral" },
];

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
  if (key.includes("MESSAGE") || key.includes("CHAT")) {
    return "message";
  }
  if (key.includes("SCHEDULE") || key.includes("APPOINT")) {
    return "info";
  }
  return "system";
}

function EventTypeBadge({ eventType }: { eventType: string }) {
  const visual = mapEventType(eventType);
  const className =
    visual === "urgent"
      ? "border-red-200 bg-red-50 text-red-700"
      : visual === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : visual === "info"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", className)}>
      {eventType.replace(/_/g, " ")}
    </Badge>
  );
}

export function NotificationsPage() {
  const router = useRouter();
  const { data: user } = useGetCurrentUserQuery();

  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [referralId, setReferralId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = {
    page,
    page_size: PAGE_SIZE,
    search: search.trim() || undefined,
    event_type: eventType !== "all" ? eventType : undefined,
    is_read:
      readFilter === "all"
        ? undefined
        : readFilter === "read"
          ? true
          : false,
    referral_id: referralId.trim() || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery(queryParams);

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  useEffect(() => {
    setPage(1);
  }, [search, eventType, readFilter, referralId, startDate, endDate]);

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;
  const unreadCount = data?.unread_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleMarkAll = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not mark all as read."));
    }
  };

  const handleOpen = async (notification: AppNotification) => {
    if (!notification.is_read) {
      try {
        await markRead(notification.id).unwrap();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Could not mark notification as read."));
      }
    }

    if (notification.referral_id) {
      const path = getReferralDetailPath(user?.role, notification.referral_id);
      if (path) router.push(path);
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Notifications
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            View and manage in-app alerts for referrals and system events.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={() => {
              void handleMarkAll();
            }}
            disabled={isMarkingAll || unreadCount === 0}
          >
            {isMarkingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Mark all read
          </Button>
        </div>
      </div>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or message"
              className="pl-9"
            />
          </div>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={readFilter}
            onValueChange={(v) => setReadFilter(v as typeof readFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Read status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread only</SelectItem>
              <SelectItem value="read">Read only</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
            placeholder="Referral ID (optional)"
          />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End date"
          />
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-background/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 py-4">
          <CardTitle className="text-base">
            {total} notification{total === 1 ? "" : "s"}
            {unreadCount > 0 ? ` · ${unreadCount} unread` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-6 py-3">Notification</TableHead>
                <TableHead className="px-6 py-3">Event</TableHead>
                <TableHead className="px-6 py-3">When</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
                <TableHead className="px-6 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : notifications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No notifications match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => {
                  const createdAt = notification.created_at
                    ? new Date(notification.created_at)
                    : new Date();

                  return (
                    <TableRow
                      key={notification.id}
                      className={cn(
                        !notification.is_read && "bg-primary/5",
                      )}
                    >
                      <TableCell className="px-6 py-4">
                        <p className="font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <EventTypeBadge eventType={notification.event_type} />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(createdAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            notification.is_read
                              ? "text-muted-foreground"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }
                        >
                          {notification.is_read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!notification.is_read && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                void markRead(notification.id);
                              }}
                            >
                              Mark read
                            </Button>
                          )}
                          {notification.referral_id && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => {
                                void handleOpen(notification);
                              }}
                            >
                              Open
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {total > 0 && (
            <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
