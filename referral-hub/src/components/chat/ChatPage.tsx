"use client";

import { useEffect, useRef, useState } from "react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  FileText,
  Loader2,
  Lock,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  WifiOff,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  chatApi,
  useGetConversationsQuery,
  type ConversationListFilter,
} from "@/features/chat/chatApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useChat } from "@/hooks/useChat";
import { useRealtime } from "@/context/RealtimeProvider";
import { buildChatUrl } from "@/lib/chatRoutes";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAppDispatch } from "@/lib/store/hooks";
import type { Conversation } from "@/types/realtime";
import { cn } from "@/lib/utils";
import { NewChatDialog } from "./NewChatDialog";

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

function formatListTime(iso: string) {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  } catch {
    return "";
  }
}

function humanizeRole(role: string) {
  return role.replace(/_/g, " ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function sortConversations(list: Conversation[]) {
  return [...list].sort((a, b) => {
    if (a.unread_count > 0 && b.unread_count === 0) return -1;
    if (b.unread_count > 0 && a.unread_count === 0) return 1;
    return (
      new Date(b.last_message_at).getTime() -
      new Date(a.last_message_at).getTime()
    );
  });
}

function isConversationActive(
  conversation: Conversation,
  selectedConversationId: string | null,
  selectedUserId: string | null,
  selectedReferralId: string | null,
) {
  if (selectedConversationId) {
    return conversation.conversation_id === selectedConversationId;
  }
  if (selectedUserId) {
    return (
      conversation.other_user_id === selectedUserId &&
      (conversation.referral_id ?? null) === (selectedReferralId || null)
    );
  }
  return false;
}

function ConnectionStatus({
  connected,
  reconnecting,
}: {
  connected: boolean;
  reconnecting: boolean;
}) {
  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>
    );
  }
  if (reconnecting) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        Reconnecting
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-rose-600">
      <WifiOff className="h-3 w-3" />
      Polling
    </span>
  );
}

function ConversationListItem({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) {
  const hasUnread = conversation.unread_count > 0;
  const isReferral = conversation.type === "referral";
  const showStatusRow =
    isReferral ||
    conversation.is_read_only ||
    conversation.is_disabled;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors",
        isActive
          ? "bg-primary/10 ring-1 ring-primary/20"
          : "hover:bg-muted/60",
        hasUnread && !isActive && "bg-muted/30",
      )}
    >
      {isActive && (
        <span
          className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary"
          aria-hidden
        />
      )}
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarFallback
            className={cn(
              "text-xs font-semibold",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary",
            )}
          >
            {getInitials(conversation.other_user_name) || "?"}
          </AvatarFallback>
        </Avatar>
        {hasUnread && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-sm leading-tight",
              hasUnread ? "font-semibold text-foreground" : "font-medium",
            )}
          >
            {conversation.other_user_name}
          </p>
          <span
            className={cn(
              "shrink-0 text-[11px] tabular-nums",
              hasUnread ? "font-medium text-primary" : "text-muted-foreground",
            )}
          >
            {formatListTime(conversation.last_message_at)}
          </span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {humanizeRole(conversation.other_user_role)} ·{" "}
          {conversation.other_user_hospital}
        </p>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 text-xs leading-snug",
            hasUnread
              ? "font-medium text-foreground/90"
              : "text-muted-foreground",
          )}
        >
          {conversation.last_message || "No messages yet"}
        </p>
        {showStatusRow && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {isReferral && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300">
                <FileText className="h-2.5 w-2.5" />
                Referral
                {conversation.referral_status && (
                  <span className="text-sky-600/80 dark:text-sky-400/80">
                    · {humanizeRole(conversation.referral_status)}
                  </span>
                )}
              </span>
            )}
            {conversation.is_read_only && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                <ShieldAlert className="h-2.5 w-2.5" />
                Closed
              </span>
            )}
            {conversation.is_disabled && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-700 dark:text-rose-300">
                <Lock className="h-2.5 w-2.5" />
                Locked
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-1 px-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-start gap-3 rounded-lg px-2.5 py-2.5"
        >
          <div className="h-11 w-11 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-2.5 w-1/2 rounded bg-muted" />
            <div className="h-2.5 w-full rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationHistorySidebar({
  conversations,
  filtered,
  isLoading,
  listFilter,
  onListFilterChange,
  search,
  onSearchChange,
  selectedConversationId,
  selectedUserId,
  selectedReferralId,
  onSelectConversation,
  totalCount,
}: {
  conversations: Conversation[];
  filtered: Conversation[];
  isLoading: boolean;
  listFilter: ConversationListFilter;
  onListFilterChange: (filter: ConversationListFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedConversationId: string | null;
  selectedUserId: string | null;
  selectedReferralId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  totalCount: number;
}) {
  const sorted = sortConversations(filtered);
  const unreadTotal = conversations.reduce(
    (sum, c) => sum + c.unread_count,
    0,
  );
  const hasSearch = search.trim().length > 0;

  const tabCounts = {
    all: conversations.length,
    direct: conversations.filter((c) => (c.type ?? "direct") === "direct")
      .length,
    referral: conversations.filter((c) => c.type === "referral").length,
  };

  return (
    <aside className="flex min-h-0 flex-col bg-muted/20 md:w-[360px] md:shrink-0 md:border-r">
      <div className="shrink-0 space-y-3 border-b bg-card/80 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Inbox</h2>
            <p className="text-[11px] text-muted-foreground">
              {totalCount} conversation{totalCount === 1 ? "" : "s"}
              {unreadTotal > 0 && (
                <span className="text-primary">
                  {" "}
                  · {unreadTotal} unread
                </span>
              )}
            </p>
          </div>
          <NewChatDialog
            referralId={selectedReferralId ?? undefined}
            triggerClassName="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
          />
        </div>

        <div
          className="flex gap-0.5 rounded-lg border bg-muted/40 p-0.5"
          role="tablist"
          aria-label="Filter conversations"
        >
          {CONVERSATION_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? tabCounts.all
                : tabCounts[tab.value];
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={listFilter === tab.value}
                onClick={() => onListFilterChange(tab.value)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                  listFilter === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-px text-[10px] tabular-nums",
                      listFilter === tab.value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted-foreground/15 text-muted-foreground",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, hospital, message…"
            className="h-9 rounded-lg border-muted-foreground/20 bg-background pl-9 pr-8 text-sm"
            aria-label="Search conversations"
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {isLoading ? (
            <ConversationListSkeleton />
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                {hasSearch ? (
                  <Search className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {hasSearch
                    ? "No matches"
                    : listFilter === "all"
                      ? "No conversations yet"
                      : `No ${listFilter} chats`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {hasSearch
                    ? "Try a different name, hospital, or message keyword."
                    : "Start a new message to connect with your care team."}
                </p>
              </div>
              {!hasSearch && (
                <NewChatDialog
                  referralId={selectedReferralId ?? undefined}
                  triggerClassName="rounded-lg"
                />
              )}
            </div>
          ) : (
            <ul className="space-y-0.5" role="list">
              {sorted.map((conversation) => (
                <li key={conversation.conversation_id}>
                  <ConversationListItem
                    conversation={conversation}
                    isActive={isConversationActive(
                      conversation,
                      selectedConversationId,
                      selectedUserId,
                      selectedReferralId,
                    )}
                    onSelect={() => onSelectConversation(conversation)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function ChatThread({
  conversationId,
  otherUserId,
  referralId,
}: {
  conversationId?: string | null;
  otherUserId?: string | null;
  referralId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const { isReconnecting } = useRealtime();
  const {
    messages,
    isLoading,
    isFetching,
    hasMore,
    fetchNextPage,
    sendMessage,
    isSending,
    isReadOnly,
    isDisabled,
    disabledReason,
    isWsConnected,
    resolvedConversation,
    currentUserId,
  } = useChat({ conversationId, otherUserId, referralId });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    try {
      await sendMessage(text);
      setDraft("");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to send message."));
    }
  };

  if (!conversationId && !otherUserId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
        <MessageSquare className="h-12 w-12 opacity-30" />
        <div>
          <p className="font-medium text-foreground">Select a conversation</p>
          <p className="text-sm">
            Choose a thread from the list to start messaging.
          </p>
        </div>
      </div>
    );
  }

  const title = resolvedConversation?.other_user_name ?? "Conversation";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {resolvedConversation && (
            <p className="text-xs text-muted-foreground">
              {resolvedConversation.other_user_role.replace(/_/g, " ")} ·{" "}
              {resolvedConversation.other_user_hospital}
              {resolvedConversation.referral_id && <> · Referral linked</>}
            </p>
          )}
        </div>
        <ConnectionStatus
          connected={isWsConnected}
          reconnecting={isReconnecting}
        />
      </div>

      <div ref={containerRef} className="min-h-0 flex-1 overflow-y-auto p-4">
        {hasMore && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchNextPage()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : null}
              Load older messages
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Send the first message below.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isMine = msg.sender_id === currentUserId;
              const isOptimistic = msg.id.startsWith("optimistic-");
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isMine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                      isMine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md border bg-background text-foreground",
                      isOptimistic && "opacity-70",
                    )}
                  >
                    {!isMine && msg.sender_name && (
                      <p className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                        {msg.sender_name}
                        {msg.sender_role
                          ? ` · ${msg.sender_role.replace(/_/g, " ")}`
                          : ""}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isMine
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatMessageTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t p-4">
        {isReadOnly ? (
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Referral closed</p>
              <p className="text-xs text-muted-foreground">
                This conversation is read-only because the referral is completed,
                rejected, redirected, or otherwise closed.
              </p>
            </div>
          </div>
        ) : isDisabled ? (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Administratively locked</p>
              <p className="text-xs">
                {disabledReason ||
                  "This channel has been locked by an administrator."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a clinical message…"
              rows={2}
              maxLength={5000}
              className="min-h-[44px] resize-none rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl"
              disabled={isSending || !draft.trim()}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

const CONVERSATION_TABS: { label: string; value: ConversationListFilter }[] = [
  { label: "All", value: "all" },
  { label: "Direct", value: "direct" },
  { label: "Referral", value: "referral" },
];

export function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { data: user } = useGetCurrentUserQuery();
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] =
    useState<ConversationListFilter>("all");

  const selectedConversationId = searchParams.get("conversation");
  const selectedUserId = searchParams.get("user");
  const selectedReferralId = searchParams.get("referral");

  const conversationsQueryArg = { page: 1, limit: 100 } as const;

  const { data: conversationsPage, isLoading: isLoadingConversations } =
    useGetConversationsQuery(conversationsQueryArg);

  const conversations = conversationsPage?.data ?? [];

  const filtered = conversations.filter((c) => {
    const channelType = c.type ?? "direct";
    if (listFilter !== "all" && channelType !== listFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.other_user_name.toLowerCase().includes(q) ||
      c.other_user_hospital.toLowerCase().includes(q) ||
      c.last_message.toLowerCase().includes(q)
    );
  });

  const selectConversation = (conversation: Conversation) => {
    if (!user?.role) return;

    const unread = conversation.unread_count;
    if (unread > 0) {
      dispatch(
        chatApi.util.updateQueryData(
          "getConversations",
          conversationsQueryArg,
          (draft) => {
            const item = draft.data.find(
              (c) => c.conversation_id === conversation.conversation_id,
            );
            if (item) item.unread_count = 0;
          },
        ),
      );
      dispatch(
        chatApi.util.updateQueryData("getChatUnreadCount", undefined, (count) =>
          Math.max(0, count - unread),
        ),
      );
    }

    router.push(
      buildChatUrl(user.role, {
        conversationId: conversation.conversation_id,
      }),
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Secure clinical messaging tied to your referrals and care team.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm md:flex-row">
        <ConversationHistorySidebar
          conversations={conversations}
          filtered={filtered}
          isLoading={isLoadingConversations}
          listFilter={listFilter}
          onListFilterChange={setListFilter}
          search={search}
          onSearchChange={setSearch}
          selectedConversationId={selectedConversationId}
          selectedUserId={selectedUserId}
          selectedReferralId={selectedReferralId}
          onSelectConversation={selectConversation}
          totalCount={conversationsPage?.total ?? conversations.length}
        />

        <div className="min-h-[420px] min-w-0 flex-1 md:min-h-0">
          <ChatThread
            conversationId={selectedConversationId}
            otherUserId={selectedUserId}
            referralId={selectedReferralId}
          />
        </div>
      </div>
    </div>
  );
}
