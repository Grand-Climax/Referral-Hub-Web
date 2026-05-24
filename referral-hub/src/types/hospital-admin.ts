/** Role values returned by the hospital-admin staff list API. */
export type HospitalStaffRole =
  | 'HOSPITAL_ADMIN'
  | 'DEPT_HEAD'
  | 'RECEPTIONIST'
  | 'RECEIVING_SPECIALIST'
  | 'LIAISON_OFFICER'
  | 'REFERRING_DOCTOR';

export const HOSPITAL_STAFF_ROLE_LABELS: Record<HospitalStaffRole, string> = {
  HOSPITAL_ADMIN: 'Hospital Admin',
  DEPT_HEAD: 'Dept Head',
  RECEPTIONIST: 'Receptionist',
  RECEIVING_SPECIALIST: 'Receiving Specialist',
  LIAISON_OFFICER: 'Liaison Officer',
  REFERRING_DOCTOR: 'Referring Doctor',
};

export const HOSPITAL_STAFF_ROLE_OPTIONS: HospitalStaffRole[] = [
  'HOSPITAL_ADMIN',
  'DEPT_HEAD',
  'RECEPTIONIST',
  'RECEIVING_SPECIALIST',
  'LIAISON_OFFICER',
  'REFERRING_DOCTOR',
];

/**
 * Roles that are *not* tied to a specific department.
 * Hospital-wide roles (admins, liaison, receptionist) and floating clinical
 * roles (receiving specialist) don't require a department assignment.
 */
export const HOSPITAL_STAFF_ROLES_WITHOUT_DEPARTMENT: ReadonlySet<string> =
  new Set([
    'HOSPITAL_ADMIN',
    'LIAISON_OFFICER',
    'RECEPTIONIST',
    'RECEIVING_SPECIALIST',
  ]);

export function hospitalStaffRoleRequiresDepartment(
  role?: string | null,
): boolean {
  if (!role) return true;
  return !HOSPITAL_STAFF_ROLES_WITHOUT_DEPARTMENT.has(role.trim().toUpperCase());
}

export function formatHospitalStaffRole(role: string): string {
  if (role in HOSPITAL_STAFF_ROLE_LABELS) {
    return HOSPITAL_STAFF_ROLE_LABELS[role as HospitalStaffRole];
  }
  return role.replace(/_/g, ' ');
}

/** Tailwind classes for role badges in staff list/grid. */
export function hospitalStaffRoleBadgeClass(role: string): string {
  switch (role) {
    case 'HOSPITAL_ADMIN':
      return 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800';
    case 'DEPT_HEAD':
      return 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800';
    case 'RECEPTIONIST':
      return 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800';
    case 'RECEIVING_SPECIALIST':
      return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
    case 'LIAISON_OFFICER':
      return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
    case 'REFERRING_DOCTOR':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
  }
}

export interface GetStaffParams {
  page?: number;
  page_size?: number;
  role?: string;
  name?: string;
  email?: string;
  dept_id?: string;
  is_active?: boolean;
}

export interface StaffDetailHospital {
  id: string;
  name: string;
  tier_level?: string;
  region?: string;
  address?: string;
  contact_phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffDetailDepartment {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HospitalAdminStaff {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  national_id?: string;
  role: string;
  hospital_id?: string;
  department_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  success?: boolean;
}

/** Staff-by-id payload including nested hospital and department from the API. */
export interface HospitalAdminStaffDetail extends HospitalAdminStaff {
  hospital?: StaffDetailHospital;
  department?: StaffDetailDepartment;
  message?: string;
}

export interface UpdateStaffPayload {
  email?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  national_id?: string;
  is_active?: boolean;
}

export interface HospitalAdminStaffResponse {
  data: HospitalAdminStaff[];
  page: number;
  total: number;
  success?: boolean;
  message?: string;
}

export interface CreateStaffPayload {
  /** Optional — hospital-wide roles (admin, liaison, receptionist) and
   *  floating specialists don't require a department. */
  department_id?: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  national_id: string;
  password: string;
  phone_number: string;
  region: string;
  role: string;
}

export interface ReplaceStaffPayload {
  new_staff_email: string;
  new_staff_first_name: string;
  new_staff_last_name: string;
  [key: string]: any;
}

export interface ChangeRolePayload {
  role: string;
  department_id?: string;
}

export interface ReferralStatusHistory {
  history_id: string;
  referral_id: string;
  changed_by_id: string;
  role: string;
  from_status: string;
  to_status: string;
  created_at: string;
}

/** Single row from GET /hospital-admin/referrals-log */
export type HospitalReferralLogEntry = ReferralStatusHistory;

export interface HospitalReferralLogResponse {
  data: HospitalReferralLogEntry[];
  page: number;
  page_size: number;
  total: number;
  success?: boolean;
  message?: string;
}

/** Hospital admin audit trail (GET /hospital-admin/audit-logs). */
export interface HospitalAdminAuditLog {
  id: string;
  user_id: string;
  action_type: string;
  resource: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

/** Query params for GET /hospital-admin/audit-logs (paginated). */
export interface GetAuditLogsParams {
  page?: number;
  page_size?: number;
  action_type?: string;
  /** YYYY-MM-DD */
  start_date?: string;
  /** YYYY-MM-DD */
  end_date?: string;
}

export interface HospitalAdminAuditLogListResponse {
  data: HospitalAdminAuditLog[];
  page: number;
  total: number;
  success?: boolean;
  message?: string;
}

export interface AcceptanceRejectionReport {
  acceptance_rate: number;
  rejection_rate: number;
  success?: boolean;
  message?: string;
}

export interface AverageWaitTimeReport {
  average_wait_time: number;
  success?: boolean;
  message?: string;
}

export interface BusiestDepartmentRow {
  department_id: string;
  count: number;
}

export interface MissedAppointmentReport {
  missed_appointment_rate: number;
  success?: boolean;
  message?: string;
}

export interface MonthlyReferralRow {
  month: string;
  count: number;
}

export interface TopReferringHospitalRow {
  hospital_id: string;
  hospital_name: string;
  count: number;
}

/** GET /hospital-admin/dashboard/personnel-widget */
export interface PersonnelWidgetStats {
  total_personnel: number;
  active_duty: number;
  inactive: number;
  access_requests: number;
  success?: boolean;
  message?: string;
}

/** Global department catalog entry (GET /departments). */
export interface DepartmentCatalogEntry {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  success?: boolean;
}

/** Hospital-scoped department link (GET /hospital-admin/departments). */
export interface HospitalAdminDepartment {
  /** Hospital–department link id (use for activation/head routes). */
  id: string;
  hospital_id?: string;
  /** Global department catalog id. */
  department_id: string;
  department?: DepartmentCatalogEntry;
  name: string;
  description?: string;
  standard_daily_limit?: number;
  is_active?: boolean;
  head_user_id?: string | null;
  head_name?: string | null;
  head_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HospitalAdminDepartmentsResponse {
  data: HospitalAdminDepartment[];
  success?: boolean;
  message?: string;
}

export interface AddHospitalDepartmentPayload {
  department_id?: string;
  name?: string;
  description?: string;
}

export interface UpdateDepartmentActivationPayload {
  is_active: boolean;
}

export interface AssignDepartmentHeadPayload {
  head_user_id: string;
}

export interface HospitalAdminProfile {
  id: string;
  name: string;
  tier_level: string;
  region: string;
  address: string;
  contact_phone: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateHospitalAdminProfilePayload {
  name?: string;
  tier_level?: string;
  region?: string;
  address?: string;
  contact_phone?: string;
}

export interface GetHospitalAdminReferralsParams {
  page?: number;
  page_size?: number;
  limit?: number;
  status?: string;
}

export interface ReferralStatsByStatusRow {
  status: string;
  count: number;
}

export type ReferralStatsByStatus =
  | ReferralStatsByStatusRow[]
  | Record<string, number>;

export interface StaffSession {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  ip_address?: string;
  user_agent?: string;
  last_active_at?: string;
  created_at?: string;
}

export interface StaffSessionListResponse {
  data: StaffSession[];
  page?: number;
  total?: number;
}

export interface ReassignStaffDepartmentPayload {
  department_id: string;
}
