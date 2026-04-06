export type ReferralListStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED";

export type ReferralListMlStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED";

export interface ReferralListItem {
  condition_at_referral: string;
  date: string;
  department: string;
  diagnosis: string;
  icd_code: string;
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name: string;
  status: string;
  [key: string]: unknown;
}

export interface ReferralListPaginatedResponse {
  data: ReferralListItem[];
  page: number;
  page_size: number;
  total: number;
}

export type ReferralListResponse = ReferralListItem[];
