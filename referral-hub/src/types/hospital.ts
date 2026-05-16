export interface Hospital {
  id: string;
  name: string;
  tier_level: string;
  region: string;
  address: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
}

export interface CreateHospitalRequest {
  address: string;
  contact_phone: string;
  name: string;
  region: string;
  tier_level: string;
}

export interface UpdateHospitalRequest {
  address: string;
  contact_phone: string;
  is_active: boolean;
  name: string;
  region: string;
  tier_level: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
}

export interface HospitalDepartmentLink {
  department_id: string;
  daily_limit: number;
}

export type LinkHospitalDepartmentRequest = HospitalDepartmentLink;
