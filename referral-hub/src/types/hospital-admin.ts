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
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  password?: string;
  department_id?: string;
  [key: string]: any;
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
  id: string;
  referral_id: string;
  status: string;
  created_at: string;
  changed_by: string;
  notes?: string;
  [key: string]: any;
}
