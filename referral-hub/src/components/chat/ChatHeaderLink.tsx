"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetChatUnreadCountQuery } from "@/features/chat/chatApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { getMessagesPagePath, isChatEnabledForRole } from "@/lib/chatRoutes";
import { cn } from "@/lib/utils";

export function ChatHeaderLink({ className }: { className?: string }) {
  const { data: user } = useGetCurrentUserQuery();
  const enabled = isChatEnabledForRole(user?.role);
  const { data: unread = 0 } = useGetChatUnreadCountQuery(undefined, {
    skip: !enabled || !user,
    pollingInterval: 60000,
  });

  if (!enabled) return null;

  const href = getMessagesPagePath(user?.role);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative hover:bg-slate-100 dark:hover:bg-slate-800",
        className,
      )}
      asChild
    >
      <Link href={href} aria-label="Messages">
        <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Link>
    </Button>
  );
}
