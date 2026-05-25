export interface SystemAdminUserHospital {
  id?: string;
  name?: string;
  tier_level?: string;
  region?: string;
}

export interface SystemAdminUserDepartment {
  id?: string;
  name?: string;
  description?: string;
}

export interface SystemAdminUser {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  national_id?: string | null;
  role: string;
  hospital_id: string;
  department_id?: string | null;
  region?: string | null;
  is_active?: boolean;
  profile_image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  hospital?: SystemAdminUserHospital;
  department?: SystemAdminUserDepartment;
  success?: boolean;
  message?: string;
}

export interface CreateSystemAdminUserRequest {
  department_id?: string;
  email: string;
  first_name: string;
  middle_name: string;
  hospital_id: string;
  last_name: string;
  national_id: string;
  password: string;
  region?: string;
  role: string;
}

export interface UpdateSystemAdminUserRequest {
  department_id?: string;
  email: string;
  first_name: string;
  hospital_id: string;
  is_active: boolean;
  last_name: string;
  middle_name: string;
  national_id: string;
  region?: string;
  role: string;
}

export interface AssignSystemAdminRoleRequest {
  role: string;
}

export interface SystemAdminUsersResponse {
  data?: SystemAdminUser[];
  users?: SystemAdminUser[];
  results?: SystemAdminUser[];
  total?: number;
  success?: boolean;
  message?: string;
}

export interface SystemAdminUsersQueryParams {
  page?: number;
  page_size?: number;
  name?: string;
  email?: string;
  hospital_id?: string;
  dept_id?: string;
  role?: string;
  is_active?: boolean;
}

export const SYSTEM_ADMIN_ROLE_OPTIONS = [
  "HOSPITAL_ADMIN",
  "REFERRING_DOCTOR",
  "LIAISON_OFFICER",
  "RECEIVING_SPECIALIST",
  "RECEPTIONIST",
  "DEPT_HEAD",
  "MOH_ANALYST",
  "SYSTEM_SUPER_ADMIN",
] as const;

export const SYSTEM_ADMIN_ROLE_LABELS: Record<string, string> = {
  HOSPITAL_ADMIN: "Hospital Admin",
  REFERRING_DOCTOR: "Referring Doctor",
  LIAISON_OFFICER: "Liaison Officer",
  RECEIVING_SPECIALIST: "Receiving Specialist",
  RECEPTIONIST: "Receptionist",
  DEPT_HEAD: "Department Head",
  MOH_ANALYST: "MoH Analyst",
  SYSTEM_SUPER_ADMIN: "System Super Admin",
};

export function normalizeSystemAdminRole(role?: string | null) {
  return (role ?? "").trim().toUpperCase();
}

export const SYSTEM_ADMIN_ROLES_WITHOUT_DEPARTMENT: ReadonlySet<string> =
  new Set([
    "HOSPITAL_ADMIN",
    "LIAISON_OFFICER",
    "RECEIVING_SPECIALIST",
    "SYSTEM_SUPER_ADMIN",
    "MOH_ANALYST",
  ]);

export function systemAdminRoleRequiresDepartment(role?: string | null) {
  return !SYSTEM_ADMIN_ROLES_WITHOUT_DEPARTMENT.has(
    normalizeSystemAdminRole(role),
  );
}

export function normalizeSystemAdminUsers(
  response: SystemAdminUsersResponse | SystemAdminUser[] | unknown,
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === "object") {
    const payload = response as SystemAdminUsersResponse & {
      data?: unknown;
      users?: unknown;
      results?: unknown;
    };
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.users)) return payload.users;
    if (Array.isArray(payload.results)) return payload.results;
  }

  return [] as SystemAdminUser[];
}

export interface SystemAdminUsersPage {
  users: SystemAdminUser[];
  total?: number;
}

export function normalizeSystemAdminUsersPage(
  response: SystemAdminUsersResponse | SystemAdminUser[] | unknown,
): SystemAdminUsersPage {
  const users = normalizeSystemAdminUsers(response);

  let total: number | undefined;
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const payload = response as SystemAdminUsersResponse & {
      total_count?: number;
      count?: number;
      meta?: { total?: number; total_count?: number; count?: number };
      pagination?: { total?: number; total_count?: number; count?: number };
    };
    total =
      payload.total ??
      payload.total_count ??
      payload.count ??
      payload.meta?.total ??
      payload.meta?.total_count ??
      payload.meta?.count ??
      payload.pagination?.total ??
      payload.pagination?.total_count ??
      payload.pagination?.count;
  }

  return { users, total };
}
