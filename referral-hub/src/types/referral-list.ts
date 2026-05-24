export type ReferralListStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING"
  | "FORWARDED"
  | "UNDER_LIAISON_REVIEW"
  | "UNDER_SPECIALIST_REVIEW"
  | "REDIRECTED"
  | "ACCEPTED"
  | "REJECTED"
  | "REJECTED_BY_LIAISON"
  | "REJECTED_BY_SPECIALIST"
  | "REJECTED_AFTER_SEND"
  | "NEED_REVISION"
  | "COMPLETED"
  | string;

export type ReferralListMlStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED";

export interface ReferralListItem {
  id: string;
  patient_first_name: string;
  patient_middle_name?: string;
  patient_last_name: string;
  patient_region: string;
  /** Department id when provided separately by the list endpoint. */
  department_id?: string;
  /** Department display name from the list endpoint. */
  department?: string;
  status: ReferralListStatus;
  icd_code: string;
  diagnosis: string;
  condition_at_referral: string;
  created_at: string;
  updated_at: string;
  ml_status: ReferralListMlStatus | string;
  ml_severity_score?: number | null;
}

export interface ReferralListPaginatedResponse {
  data: ReferralListItem[];
  page: number;
  page_size: number;
  limit?: number;
  total: number;
}

export type ReferralListResponse = ReferralListItem[];

export function formatReferralPatientName(item: Pick<
  ReferralListItem,
  "patient_first_name" | "patient_middle_name" | "patient_last_name"
>): string {
  return [
    item.patient_first_name,
    item.patient_middle_name,
    item.patient_last_name,
  ]
    .filter(Boolean)
    .join(" ");
}

export function humanizeReferralValue(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
