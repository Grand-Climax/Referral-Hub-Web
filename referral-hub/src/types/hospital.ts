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

export interface Department {
  id: string;
  name: string;
}
