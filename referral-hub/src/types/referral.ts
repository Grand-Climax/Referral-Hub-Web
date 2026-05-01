export type UserRole =
  | "referring_doctor"
  | "receiving_specialist"
  | "hospital_admin"
  | "receptionist"
  | "department_head"
  | "liaison_officer"
  | "moh_analyst";

export const ROLE_LABELS: Record<UserRole, string> = {
  referring_doctor: "Referring Doctor",
  receiving_specialist: "Receiving Specialist",
  hospital_admin: "Hospital Admin",
  receptionist: "Receptionist",
  department_head: "Department Head",
  liaison_officer: "Liaison Officer",
  moh_analyst: "MoH Analyst",
};

export type ReferralStatus = "DRAFT" | "SUBMITTED" | "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";
export type ReferralMlStatus = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export type SeverityLevel = "critical" | "high" | "medium" | "low";

export interface ReferralPatient {
  id: string;
  national_id_enc?: string | null;
  national_id_hash?: string | null;
  phone_number: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  sex: "male" | "female";
  date_of_birth: string;
  home_region?: string | null;
  is_deleted?: boolean;
  deleted_at?: string | null;
}

export interface Vital {
  id: string;
  referral_id: string;
  recorded_at: string;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate: number;
  sp_o2: number;
  temperature: number;
  respiratory_rate: number;
  gcs_score?: number | null;
}

export interface CodeInfo {
  code: string;
  description: string;
  category: string;
}

export interface Diagnosis {
  id: string;
  referral_id: string;
  icd_code: string;
  is_primary: boolean;
  diagnosis_certainty: "SUSPECTED" | "CONFIRMED";
  code_info: CodeInfo;
}

export interface ReferralForm {
  id: string;
  referral_id: string;
  clinical_summary: string;
  patient_history: string;
  physical_examination_findings?: string | null;
  investigation_results?: string | null;
  treatment_given_before_referral?: string | null;
  medication_on_transfer?: string | null;
  reason_of_referral: string;
  reason_for_referral_category: string;
  condition_at_referral: string;
  mode_of_transport?: string | null;
  accompanying_person_name?: string | null;
  accompanying_person_phone?: string | null;
}

export interface EmergencyDetail {
  id: string;
  referral_id: string;
  emergency_justification: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  referring_doctor_id: string;
  sender_hospital_id: string;
  target_hospital_id: string;
  liaison_officer_id?: string | null;
  target_dept_id: string;
  status: ReferralStatus;
  waiting_hours_weight?: number;
  ml_status?: ReferralMlStatus;
  ml_retry_count?: number;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  patient?: ReferralPatient;
  diagnoses?: Diagnosis[];
  vitals?: Vital[];
  referral_form?: ReferralForm;
  emergency_detail?: EmergencyDetail;
  comments?: ReferralComment[];

  [key: string]: unknown;
  severity?: SeverityLevel;
}

export interface ReferralComment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospital: string;
  department?: string;
}

export interface CreateReferralRequest {
  accompanying_person_name?: string;
  accompanying_person_phone?: string;
  clinical_summary: string;
  condition_at_referral: "STABLE" | "UNSTABLE" | "CRITICAL" | "IMPROVING";
  diagnoses: Array<{
    diagnosis_certainty: "SUSPECTED" | "CONFIRMED";
    icd_code: string;
    is_primary: boolean;
  }>;
  emergency_detail?: {
    emergency_justification: string;
  };
  investigation_results?: string;
  liaison_officer_id?: string;
  medication_on_transfer?: string;
  mode_of_transport: "PRIVATE" | "AMBULANCE" | "HOSPITAL_TRANSFER" | "OTHER";
  patient_history: string;
  physical_examination_findings?: string;
  patient_id: string;
  reason_for_referral_category: "EMERGENCY" | "ROUTINE";
  reason_of_referral: string;
  status: "SUBMITTED" | "DRAFT";
  target_dept_id: string;
  target_hospital_id: string;
  treatment_given_before_referral?: string;
  vitals: {
    diastolic_bp: number;
    gcs_score: number;
    heart_rate: number;
    respiratory_rate: number;
    sp_o2: number;
    systolic_bp: number;
    temperature: number;
  };
}
