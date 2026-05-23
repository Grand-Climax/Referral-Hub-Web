"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLazyGetContactsQuery } from "@/features/chat/chatApi";
import { useGetCurrentUserQuery } from "@/features/auth/authApi";
import { buildChatUrl } from "@/lib/chatRoutes";
import { getApiErrorMessage } from "@/lib/apiError";
import type { ChatContact } from "@/types/realtime";

function contactLabel(contact: ChatContact) {
  return `${contact.first_name} ${contact.last_name}`.trim();
}

export function NewChatDialog({
  referralId,
  triggerClassName,
}: {
  referralId?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const { data: user } = useGetCurrentUserQuery();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fetchContacts, { data: contactsPage, isFetching }] =
    useLazyGetContactsQuery();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    fetchContacts({
      referral_id: referralId,
      search: debouncedSearch || undefined,
      limit: 50,
    }).catch((err) => {
      toast.error(getApiErrorMessage(err, "Failed to load contacts."));
    });
  }, [open, debouncedSearch, referralId, fetchContacts]);

  const startChat = (contact: ChatContact) => {
    if (!user?.role) return;
    setOpen(false);
    router.push(
      buildChatUrl(user.role, {
        otherUserId: contact.user_id,
        referralId,
      }),
    );
  };

  const contacts = contactsPage?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={triggerClassName}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          New message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a conversation</DialogTitle>
          <DialogDescription>
            {referralId
              ? "Select a colleague connected to this referral case."
              : "Search for a colleague you are allowed to message."}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>
        <ScrollArea className="max-h-72 pr-2">
          {isFetching ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : contacts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No eligible contacts found.
            </p>
          ) : (
            <ul className="space-y-1">
              {contacts.map((contact) => (
                <li key={contact.user_id}>
                  <button
                    type="button"
                    onClick={() => startChat(contact)}
                    className="flex w-full flex-col rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border hover:bg-muted/50"
                  >
                    <span className="text-sm font-medium">
                      {contactLabel(contact)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {contact.role.replace(/_/g, " ")} · {contact.hospital_name}
                      {contact.department_name
                        ? ` · ${contact.department_name}`
                        : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
