import {
  Diagnosis,
  ReferralAttachment,
  ReferralForm,
  ReferralPatient,
  Vital,
} from "./referral";
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
  triage_status?: string | null;
  waiting_hours_weight: number;
  ml_status: ReferralMlStatus;
  ml_retry_count: number;
  ml_severity_score?: number | null;
  ml_last_error?: string | null;
  ml_successful_rerun_count?: number;
  ml_run_started_at?: string | null;
  ml_last_failed_at?: string | null;
  ml_severity_tier?: MlSeverityTier | null;
  ml_explanations?: string[] | null;
  ml_model_version?: string | null;
  patient_identity_verified?: boolean;
  clinical_history_attached?: boolean;
  vitals_included?: boolean;
  attachments_included?: boolean;
  rejection_reason?: string | null;
  specialist_id?: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  patient: ReferralPatient;
  referral_form: ReferralForm;
  diagnoses: Diagnosis[];
  vitals: Vital[];
  attachments?: ReferralAttachment[];
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

export interface RedirectHospitalOption {
  id: string;
  name: string;
  department_id?: string | null;
  target_dept_id?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  [key: string]: unknown;
}

export interface RedirectOptionsResponse {
  data?: RedirectHospitalOption[];
  hospitals?: RedirectHospitalOption[];
  success?: boolean;
  message?: string;
}

export interface RedirectReferralRequest {
  id: string;
  target_hospital_id: string;
  department_id: string;
  reason: string;
}

export interface ReleaseReferralRequest {
  id: string;
  reason: string;
}

export type MlTriggerReason = "INITIAL" | "RESUBMIT" | "RERUN" | string;

export type MlSeverityTier = "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | string;

export type ReferralMlStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "SKIPPED"
  | "MANUAL"
  | string;

export interface MlPredictionExplanation {
  top_features?: string[];
  [key: string]: unknown;
}

export interface MlPredictionDetail {
  id: string;
  referral_id: string;
  trigger_reason: MlTriggerReason;
  output_score: number;
  severity_tier?: MlSeverityTier | null;
  confidence_level?: number | null;
  explanation?: MlPredictionExplanation | null;
  model_version: string;
  processing_time_ms?: number | null;
  predicted_at: string;
  is_overridden: boolean;
  overridden_score?: number | null;
  overridden_by?: string | null;
  override_justification?: string | null;
}

export interface MlPredictionResponse {
  success: boolean;
  message: string;
  data: MlPredictionDetail;
}

export interface MlSeverityOverrideRequest {
  score: number;
  justification: string;
}

export interface MlSeverityOverrideResponse {
  success: boolean;
  message: string;
}
