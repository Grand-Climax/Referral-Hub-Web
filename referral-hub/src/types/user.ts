export interface UserHospital {
  id: string;
  name: string;
  tier_level: string;
  region: string;
  address: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  success?: boolean;
}

export interface UserDepartment {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  success?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  national_id: string;
  role: string;
  hospital_id: string;
  department_id?: string;
  hospital?: UserHospital;
  department?: UserDepartment;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  success?: boolean;
  message?: string;
}
