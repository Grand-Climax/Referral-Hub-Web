type RoleKey =
  | "referring_doctor"
  | "hospital_admin"
  | "liaison_officer"
  | "receptionist"
  | "dept_head"
  | "moh_analyst"
  | "receiving_specialist"
  | "system_super_admin";

const ROLE_MAP: Record<string, RoleKey> = {
  REFERRING_DOCTOR: "referring_doctor",
  HOSPITAL_ADMIN: "hospital_admin",
  LIAISON_OFFICER: "liaison_officer",
  RECEPTIONIST: "receptionist",
  DEPT_HEAD: "dept_head",
  DEPARTMENT_HEAD: "dept_head",
  MOH_ANALYST: "moh_analyst",
  RECEIVING_SPECIALIST: "receiving_specialist",
  SYSTEM_SUPER_ADMIN: "system_super_admin",
};

type NotificationRoleKey = Exclude<RoleKey, "moh_analyst">;

const NOTIFICATIONS_PAGE_BY_ROLE: Record<NotificationRoleKey, string> = {
  referring_doctor: "/referring-doctor/notifications",
  hospital_admin: "/hospital-admin/notifications",
  liaison_officer: "/liaison-officer/notifications",
  receptionist: "/receptionist/notifications",
  dept_head: "/department-head/notifications",
  receiving_specialist: "/receiving-specialist/notifications",
  system_super_admin: "/systemAdmin/notifications",
};

const REFERRAL_DETAIL_BY_ROLE: Record<
  NotificationRoleKey,
  (id: string) => string
> = {
  referring_doctor: (id) => `/referring-doctor/${id}`,
  hospital_admin: (id) => `/hospital-admin/referral-logs`,
  liaison_officer: (id) => `/liaison-officer/referrals/${id}`,
  receptionist: (id) => `/receptionist`,
  dept_head: (id) => `/department-head`,
  receiving_specialist: (id) => `/receiving-specialist/${id}`,
  system_super_admin: (id) => `/systemAdmin/users`,
};

export function isNotificationsEnabledForRole(
  rawRole?: string | null,
): boolean {
  return normalizeRoleKey(rawRole) !== "moh_analyst";
}

export function normalizeRoleKey(rawRole?: string | null): RoleKey | undefined {
  if (!rawRole) return undefined;
  const upper = rawRole.toUpperCase();
  return ROLE_MAP[upper] ?? ROLE_MAP[rawRole] ?? undefined;
}

export function getNotificationsPagePath(rawRole?: string | null): string {
  const role = normalizeRoleKey(rawRole);
  if (!role || role === "moh_analyst") return "/";
  return NOTIFICATIONS_PAGE_BY_ROLE[role];
}

export function getReferralDetailPath(
  rawRole: string | null | undefined,
  referralId: string,
): string | null {
  const role = normalizeRoleKey(rawRole);
  if (!role || role === "moh_analyst" || !referralId) return null;
  return REFERRAL_DETAIL_BY_ROLE[role](referralId);
}
