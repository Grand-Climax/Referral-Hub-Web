import { Diagnosis, ReferralForm, ReferralPatient, Vital } from "./referral";
import { ReferralListItem, ReferralListStatus } from "./referral-list";

export interface SpecialistReferralListItem extends ReferralListItem {
  // All common fields are inherited from ReferralListItem
  // We specify they are required for specialist if needed, but ReferralListItem already has them.
}

export interface SpecialistReferralListResponse {
  data: SpecialistReferralListItem[];
  success: boolean;
  message: string;
  total: number;
  page: number;
  limit: number;
}

export interface SpecialistReferralDetail {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  sender_hospital_id: string;
  target_hospital_id: string;
  liaison_officer_id?: string | null;
  target_dept_id: string;
  status: ReferralListStatus;
  waiting_hours_weight: number;
  ml_status: string;
  ml_retry_count: number;
  rejection_reason?: string | null;
  specialist_id?: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  patient: ReferralPatient;
  referral_form: ReferralForm;
  diagnoses: Diagnosis[];
  vitals: Vital[];
}

export interface SpecialistReferralDetailResponse extends SpecialistReferralDetail {
  success: boolean;
  message: string;
}

export interface AcceptReferralRequest {
  id: string;
}

export interface RejectReferralRequest {
  id: string;
  rejection_reason: string;
}
