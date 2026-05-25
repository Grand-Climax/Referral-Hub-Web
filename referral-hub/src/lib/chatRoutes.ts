import {
  isNotificationsEnabledForRole,
  normalizeRoleKey,
} from "@/lib/notificationRoutes";

const MESSAGES_PAGE_BY_ROLE = {
  referring_doctor: "/referring-doctor/messages",
  hospital_admin: "/hospital-admin/messages",
  liaison_officer: "/liaison-officer/messages",
  receptionist: "/receptionist/messages",
  dept_head: "/department-head/messages",
  receiving_specialist: "/receiving-specialist/messages",
  system_super_admin: "/systemAdmin/messages",
};

export function isChatEnabledForRole(rawRole?: string | null): boolean {
  return isNotificationsEnabledForRole(rawRole);
}

export function getMessagesPagePath(rawRole?: string | null): string {
  const role = normalizeRoleKey(rawRole);
  if (!role || role === "moh_analyst") return "/";
  return (
    MESSAGES_PAGE_BY_ROLE[role as keyof typeof MESSAGES_PAGE_BY_ROLE] ?? "/"
  );
}

export function buildChatUrl(
  rawRole: string | null | undefined,
  params: {
    conversationId?: string;
    otherUserId?: string;
    referralId?: string;
  },
): string {
  const base = getMessagesPagePath(rawRole);
  const search = new URLSearchParams();
  if (params.conversationId) {
    search.set("conversation", params.conversationId);
  }
  if (params.otherUserId) {
    search.set("user", params.otherUserId);
  }
  if (params.referralId) {
    search.set("referral", params.referralId);
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}
