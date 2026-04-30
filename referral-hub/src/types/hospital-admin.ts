export interface HospitalAdminStaff {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  department_id?: string;
  [key: string]: any;
}

export interface HospitalAdminStaffResponse {
  data: HospitalAdminStaff[];
  page: number;
  limit: number;
  total: number;
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
