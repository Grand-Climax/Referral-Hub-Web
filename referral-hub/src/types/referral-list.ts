export type ReferralListStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "REJECTED_BY_SPECIALIST"
  | "COMPLETED";

export type ReferralListMlStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED";

export interface ReferralListItem {
  condition_at_referral: string;
  created_at: string;
  updated_at: string;
  /** Department id from list endpoint; resolve to name via department API when needed. */
  department: string;
  diagnosis: string;
  icd_code: string;
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name: string;
  patient_region: string;
  status: ReferralListStatus;
  /** Backward compatibility for older consumers that still read `date`. */
  date?: string;
  [key: string]: unknown;
}

export interface ReferralListPaginatedResponse {
  data: ReferralListItem[];
  page: number;
  page_size: number;
  limit?: number;
  total: number;
}

export type ReferralListResponse = ReferralListItem[];
