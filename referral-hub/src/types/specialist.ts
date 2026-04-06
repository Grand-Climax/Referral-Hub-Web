import { Diagnosis, ReferralForm, ReferralPatient, Vital } from "./referral";

export interface SpecialistReferralListItem {
  id: string;
  patient_first_name: string;
  patient_middle_name: string;
  patient_last_name: string;
  department: string;
  date: string;
  status: string;
  icd_code: string;
  diagnosis: string;
  condition_at_referral: string;
}

export interface SpecialistReferralListResponse {
  data: SpecialistReferralListItem[];
  success: boolean;
  message: string;
  total: number;
  page: number;
  page_size: number;
}

export interface SpecialistReferralDetail {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  sender_hospital_id: string;
  target_hospital_id: string;
  liaison_officer_id?: string | null;
  target_dept_id: string;
  status: string;
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
