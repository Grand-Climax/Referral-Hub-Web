"use client";

import { useEffect, useRef, useState } from "react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import {
  Loader2,
  Lock,
  MessageSquare,
  Search,
  Send,
  ShieldAlert,
  WifiOff,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useGetConversationsQuery } from "@/features/chat/chatApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { useChat } from "@/hooks/useChat";
import { useRealtime } from "@/context/RealtimeProvider";
import { buildChatUrl } from "@/lib/chatRoutes";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Conversation } from "@/types/realtime";
import { cn } from "@/lib/utils";

function formatMessageTime(iso: string) {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

function formatConversationTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
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
  const initials = conversation.other_user_name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        isActive
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : "border-transparent hover:border-border hover:bg-muted/50",
      )}
    >
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">
            {conversation.other_user_name}
          </p>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatConversationTime(conversation.last_message_at)}
          </span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.other_user_role.replace(/_/g, " ")} ·{" "}
          {conversation.other_user_hospital}
        </p>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {conversation.last_message || "No messages yet"}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {conversation.unread_count > 0 && (
            <Badge className="h-5 px-1.5 text-[10px]">
              {conversation.unread_count} unread
            </Badge>
          )}
          {conversation.is_read_only && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              Read-only
            </Badge>
          )}
          {conversation.is_disabled && (
            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
              Locked
            </Badge>
          )}
        </div>
      </div>
    </button>
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
                    )}
                  >
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

export function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user } = useGetCurrentUserQuery();
  const [search, setSearch] = useState("");

  const selectedConversationId = searchParams.get("conversation");
  const selectedUserId = searchParams.get("user");
  const selectedReferralId = searchParams.get("referral");

  const { data: conversationsPage, isLoading: isLoadingConversations } =
    useGetConversationsQuery({ page: 1, limit: 100 });

  const conversations = conversationsPage?.data ?? [];
  const filtered = conversations.filter((c) => {
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
    router.push(
      buildChatUrl(user.role, {
        conversationId: conversation.conversation_id,
      }),
    );
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Secure clinical messaging tied to your referrals and care team.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden rounded-2xl border bg-card shadow-sm md:grid-cols-[320px_1fr]">
        <div className="flex min-h-0 flex-col border-b md:border-b-0 md:border-r">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations…"
                className="rounded-xl pl-9"
              />
            </div>
          </div>
          <ScrollArea className="min-h-0 flex-1 p-2">
            {isLoadingConversations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No conversations yet.
              </p>
            ) : (
              <div className="space-y-1">
                {filtered.map((conversation) => (
                  <ConversationListItem
                    key={conversation.conversation_id}
                    conversation={conversation}
                    isActive={
                      selectedConversationId === conversation.conversation_id
                    }
                    onSelect={() => selectConversation(conversation)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="min-h-[420px] md:min-h-0">
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
