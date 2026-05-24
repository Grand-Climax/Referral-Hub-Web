export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const AUTH_ROUTES = {
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  REFRESH: "/api/v1/auth/refresh",
  ME: "/api/v1/users/me",
} as const;

/** Hospital-scoped user directory & profile (Bearer). */
export const USER_ROUTES = {
  LIST: "/api/v1/users",
  ME: "/api/v1/users/me",
  BY_ID: (id: string) => `/api/v1/users/${id}`,
  PROFILE_IMAGE: "/api/v1/users/profile/image",
} as const;

export const HOSPITAL_ROUTES = {
  CREATE: "/api/v1/hospitals",
  GET_BY_ID: (id: string) => `/api/v1/hospitals/${id}`,
  UPDATE: (id: string) => `/api/v1/hospitals/${id}`,
  DELETE: (id: string) => `/api/v1/hospitals/${id}`,
  LIST_DEPARTMENTS: (id: string) => `/api/v1/hospitals/${id}/departments`,
  LINK_DEPARTMENT: (id: string) => `/api/v1/hospitals/${id}/departments`,
  UNLINK_DEPARTMENT: (id: string, deptId: string) =>
    `/api/v1/hospitals/${id}/departments/${deptId}`,
} as const;

export const REFERRAL_ROUTES = {
  CREATE: "/api/v1/doctor/referrals",
  LIST: "/api/v1/doctor/referrals",
  GET_BY_ID: (id: string) => `/api/v1/doctor/referrals/${id}`,
  RESUBMIT: (id: string) => `/api/v1/doctor/referrals/${id}/submit`,
} as const;

export const PATIENT_ROUTES = {
  CREATE: "/api/v1/patients",
  LOOKUP: "/api/v1/patients/lookup",
} as const;

export const DEPARTMENT_ROUTES = {
  LIST: "/api/v1/departments",
  CREATE: "/api/v1/departments",
  GET_BY_ID: (id: string) => `/api/v1/departments/${id}`,
  UPDATE: (id: string) => `/api/v1/departments/${id}`,
  DELETE: (id: string) => `/api/v1/departments/${id}`,
} as const;

export const REFERENCE_ROUTES = {
  HOSPITALS: "/api/v1/reference/hospitals",
  NETWORKED_HOSPITALS: "/api/v1/reference/networked-hospitals",
  DEPARTMENTS: (hospitalId: string) =>
    `/api/v1/reference/hospitals/${hospitalId}/departments`,
  LIAISONS: "/api/v1/reference/liaisons",
  ICD10_CODES: "/api/v1/reference/icd-codes",
  REGIONS: "/api/v1/reference/regions",
} as const;

export const LIAISON_ROUTES = {
  LIST: "/api/v1/liaison/referrals/",
  APPROVED: "/api/v1/liaison/referrals/approved",
  REJECTED: "/api/v1/liaison/referrals/rejected",
  INCOMING: "/api/v1/liaison/referrals/incoming",
  DASHBOARD_STATS: "/api/v1/liaison/referrals/dashboard/stats",
  GET_BY_ID: (id: string) => `/api/v1/liaison/referrals/${id}`,
  FORWARD: (id: string) => `/api/v1/liaison/referrals/${id}/forward`,
  READ: (id: string) => `/api/v1/liaison/referrals/${id}/read`,
  REJECT: (id: string) => `/api/v1/liaison/referrals/${id}/reject`,
  REJECT_AFTER_SEND: (id: string) => `/api/v1/liaison/referrals/${id}/reject-after-send`,
  REVISE: (id: string) => `/api/v1/liaison/referrals/${id}/revise`,
  REVIEW_CHECKLIST: (id: string) =>
    `/api/v1/liaison/referrals/${id}/review-checklist`,
} as const;

export const SPECIALIST_ROUTES = {
  LIST: "/api/v1/specialist/referrals",
  APPROVED: "/api/v1/specialist/referrals/approved",
  REJECTED: "/api/v1/specialist/referrals/rejected",
  GET_BY_ID: (id: string) => `/api/v1/specialist/referrals/${id}`,
  ACCEPT: (id: string) => `/api/v1/specialist/referrals/${id}/accept`,
  REJECT: (id: string) => `/api/v1/specialist/referrals/${id}/reject`,
  READ: (id: string) => `/api/v1/specialist/referrals/${id}/read`,
  RELEASE: (id: string) => `/api/v1/specialist/referrals/${id}/release`,
  REDIRECT: (id: string) => `/api/v1/specialist/referrals/${id}/redirect`,
  REDIRECT_OPTIONS: (id: string) => `/api/v1/specialist/referrals/${id}/redirect-options`,
} as const;

export const SYSTEM_ADMIN_ROUTES = {
  USERS: "/api/v1/system-admin/users",
  USER_BY_ID: (id: string) => `/api/v1/system-admin/users/${id}`,
  USER_PROFILE_IMAGE: (id: string) =>
    `/api/v1/system-admin/users/${id}/profile/image`,
  USER_ROLE: (id: string) => `/api/v1/system-admin/users/${id}/role`,
} as const;

export const RECEPTIONIST_ROUTES = {
  DOCTORS: "/api/v1/receptionist/doctors",
  LIST: "/api/v1/receptionist/referrals",
  MISSED: "/api/v1/receptionist/referrals/missed",
  OFFLINE_DATA: "/api/v1/receptionist/referrals/offline-data",
  UPCOMING: "/api/v1/receptionist/referrals/upcoming",
  GET_BY_ID: (id: string) => `/api/v1/receptionist/referrals/${id}`,
  ARRIVE: (id: string) => `/api/v1/receptionist/referrals/${id}/arrive`,
  ASSIGN_DOCTOR: (id: string) => `/api/v1/receptionist/referrals/${id}/assign-doctor`,
  MISS: (id: string) => `/api/v1/receptionist/referrals/${id}/miss`,
  REVOKE_DOCTOR: (id: string) => `/api/v1/receptionist/referrals/${id}/revoke-doctor`,
} as const;

export const HOSPITAL_ADMIN_ROUTES = {
  AUDIT_LOGS: "/api/v1/hospital-admin/audit-logs",
  DASHBOARD_PERSONNEL_WIDGET: "/api/v1/hospital-admin/dashboard/personnel-widget",
  DEPARTMENTS: "/api/v1/hospital-admin/departments",
  DEPARTMENT_ACTIVATION: (deptId: string) =>
    `/api/v1/hospital-admin/departments/${deptId}/activation`,
  DEPARTMENT_HEAD: (deptId: string) =>
    `/api/v1/hospital-admin/departments/${deptId}/head`,
  HOSPITAL_PROFILE: "/api/v1/hospital-admin/hospital/profile",
  REFERRALS_LOG: "/api/v1/hospital-admin/referrals-log",
  REFERRALS_INBOUND: "/api/v1/hospital-admin/referrals/inbound",
  REFERRALS_OUTBOUND: "/api/v1/hospital-admin/referrals/outbound",
  REFERRALS_PENDING_APPROVALS:
    "/api/v1/hospital-admin/referrals/pending-approvals",
  REFERRALS_REJECTED_REDIRECTED:
    "/api/v1/hospital-admin/referrals/rejected-redirected",
  REFERRALS_STATS_BY_STATUS:
    "/api/v1/hospital-admin/referrals/stats/by-status",
  REFERRAL_BY_ID: (id: string) => `/api/v1/hospital-admin/referrals/${id}`,
  REPORTS_ACCEPTANCE_REJECTION_RATE:
    "/api/v1/hospital-admin/reports/acceptance-rejection-rate",
  REPORTS_AVERAGE_WAIT_TIME:
    "/api/v1/hospital-admin/reports/average-wait-time",
  REPORTS_BUSIEST_DEPARTMENTS:
    "/api/v1/hospital-admin/reports/busiest-departments",
  REPORTS_MISSED_APPOINTMENT_RATE:
    "/api/v1/hospital-admin/reports/missed-appointment-rate",
  REPORTS_MONTHLY_REFERRALS:
    "/api/v1/hospital-admin/reports/monthly-referrals",
  REPORTS_TOP_REFERRING_HOSPITALS:
    "/api/v1/hospital-admin/reports/top-referring-hospitals",
  STATUS_HISTORY: (id: string) => `/api/v1/hospital-admin/referrals/${id}/status-history`,
  STAFF: "/api/v1/hospital-admin/staff",
  STAFF_BY_ID: (id: string) => `/api/v1/hospital-admin/staff/${id}`,
  STAFF_SESSIONS: "/api/v1/hospital-admin/staff/sessions",
  /** PATCH body: `{ "is_active": boolean }` */
  STAFF_ACTIVATION: (id: string) => `/api/v1/hospital-admin/staff/${id}/activation`,
  STAFF_DEPARTMENT: (id: string) => `/api/v1/hospital-admin/staff/${id}/department`,
  STAFF_FORCE_LOGOUT: (id: string) =>
    `/api/v1/hospital-admin/staff/${id}/force-logout`,
  REPLACE_STAFF: (id: string) => `/api/v1/hospital-admin/staff/${id}/replace`,
  CHANGE_ROLE: (id: string) => `/api/v1/hospital-admin/staff/${id}/role`,
} as const;

export const DEPARTMENT_HEAD_ROUTES = {
  // Capacity Override endpoints
  LIST_CAPACITY_OVERRIDES: "/api/v1/department-head/capacity/overrides",
  CREATE_CAPACITY_OVERRIDE: "/api/v1/department-head/capacity/overrides",
  UPDATE_CAPACITY_OVERRIDE: (id: string) =>
    `/api/v1/department-head/capacity/overrides/${id}`,
  DELETE_CAPACITY_OVERRIDE: (id: string) =>
    `/api/v1/department-head/capacity/overrides/${id}`,

  // Schedule endpoints
  VIEW_SCHEDULE: "/api/v1/department-head/schedule",
  RUN_BATCH_SCHEDULING: "/api/v1/department-head/schedule/batch",
  UPDATE_MAX_SLOTS: (id: string) =>
    `/api/v1/department-head/schedule/${id}/max-slots`,
  
  // Triage Queue endpoint (department head specific)
  TRIAGE_QUEUE: "/api/v1/department-head/triage-queue",
} as const;

export const MOH_ROUTES = {
  DASHBOARD_SUMMARY: "/api/v1/moh/dashboard/summary",
  DISEASE_HOTSPOTS: "/api/v1/moh/disease-hotspots",
  HOSPITAL_LOAD: "/api/v1/moh/hospital-load",
  REFERRAL_TRENDS: "/api/v1/moh/referral-trends",
  SEVERITY_DISTRIBUTION: "/api/v1/moh/severity-distribution",
  EXPORT_REPORT: "/api/v1/moh/reports/export",
} as const;

export const ADMIN_NETWORK_ROUTES = {
  LIST: "/api/v1/admin/network-routes",
  CREATE: "/api/v1/admin/network-routes",
  DELETE: (id: string) => `/api/v1/admin/network-routes/${id}`,
} as const;

export const ADMIN_CONFIG_ROUTES = {
  CONFIG: "/api/v1/admin/config",
} as const;

export const NOTIFICATION_ROUTES = {
  LIST: "/api/v1/me/notifications",
  UNREAD_COUNT: "/api/v1/me/notifications/unread-count",
  READ: (id: string) => `/api/v1/me/notifications/${id}/read`,
  READ_ALL: "/api/v1/me/notifications/read-all",
} as const;

export const CHAT_ROUTES = {
  CONVERSATIONS: "/api/v1/chat/conversations",
  CONTACTS: "/api/v1/chat/contacts",
  MESSAGES: "/api/v1/chat/messages",
  MESSAGES_READ: "/api/v1/chat/messages/read",
  UNREAD_COUNT: "/api/v1/chat/unread-count",
  TOGGLE_DISABLED: (id: string) =>
    `/api/v1/chat/conversations/${id}/toggle-disabled`,
  DELETE_CONVERSATION: (id: string) => `/api/v1/chat/conversations/${id}`,
} as const;