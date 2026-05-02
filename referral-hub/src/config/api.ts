export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const AUTH_ROUTES = {
  LOGIN: "/api/v1/auth/login",
  LOGOUT: "/api/v1/auth/logout",
  REFRESH: "/api/v1/auth/refresh",
  ME: "/api/v1/users/me",
} as const;

export const HOSPITAL_ROUTES = {
  GET_BY_ID: (id: string) => `/api/v1/hospitals/${id}`,
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
  GET_BY_ID: (id: string) => `/api/v1/departments/${id}`,
} as const;

export const REFERENCE_ROUTES = {
  HOSPITALS: "/api/v1/reference/hospitals",
  NETWORKED_HOSPITALS: "/api/v1/reference/networked-hospitals",
  DEPARTMENTS: (hospitalId: string) =>
    `/api/v1/reference/hospitals/${hospitalId}/departments`,
  LIAISONS: "/api/v1/reference/liaisons",
  ICD10_CODES: "/api/v1/reference/icd-codes",
} as const;

export const LIAISON_ROUTES = {
  LIST: "/api/v1/liaison/referrals/",
  GET_BY_ID: (id: string) => `/api/v1/liaison/referrals/${id}`,
  FORWARD: (id: string) => `/api/v1/liaison/referrals/${id}/forward`,
  READ: (id: string) => `/api/v1/liaison/referrals/${id}/read`,
  REJECT: (id: string) => `/api/v1/liaison/referrals/${id}/reject`,
  REVISE: (id: string) => `/api/v1/liaison/referrals/${id}/revise`,
} as const;

export const SPECIALIST_ROUTES = {
  LIST: "/api/v1/specialist/referrals",
  GET_BY_ID: (id: string) => `/api/v1/specialist/referrals/${id}`,
  ACCEPT: (id: string) => `/api/v1/specialist/referrals/${id}/accept`,
  REJECT: (id: string) => `/api/v1/specialist/referrals/${id}/reject`,
  READ: (id: string) => `/api/v1/specialist/referrals/${id}/read`,
  RELEASE: (id: string) => `/api/v1/specialist/referrals/${id}/release`,
} as const;

export const SYSTEM_ADMIN_ROUTES = {
  USERS: "/api/v1/system-admin/users",
  USER_BY_ID: (id: string) => `/api/v1/system-admin/users/${id}`,
  USER_PROFILE_IMAGE: (id: string) =>
    `/api/v1/system-admin/users/${id}/profile/image`,
  USER_ROLE: (id: string) => `/api/v1/system-admin/users/${id}/role`,
} as const;

export const RECEPTIONIST_ROUTES = {
  LIST: "/api/v1/receptionist",
  SCHEDULE: "/api/v1/receptionist/schedule",
  WALK_IN: "/api/v1/receptionist/walk-in",
  GET_BY_ID: (id: string) => `/api/v1/receptionist/${id}`,
  ARRIVE: (id: string) => `/api/v1/receptionist/${id}/arrive`,
  ASSIGN_DOCTOR: (id: string) => `/api/v1/receptionist/${id}/assign-doctor`,
  MISS: (id: string) => `/api/v1/receptionist/${id}/miss`,
} as const;

export const HOSPITAL_ADMIN_ROUTES = {
  STATUS_HISTORY: (id: string) => `/api/v1/hospital-admin/referrals/${id}/status-history`,
  STAFF: "/api/v1/hospital-admin/staff",
  STAFF_BY_ID: (id: string) => `/api/v1/hospital-admin/staff/${id}`,
  /** PATCH body: `{ "is_active": boolean }` */
  STAFF_ACTIVATION: (id: string) => `/api/v1/hospital-admin/staff/${id}/activation`,
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
} as const;