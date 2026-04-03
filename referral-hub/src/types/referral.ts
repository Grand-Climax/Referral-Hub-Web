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

export type ReferralStatus = string;

export type SeverityLevel = "critical" | "high" | "medium" | "low";

export interface Patient {
  ID: string;
  NationalIDEnc?: string | null;
  NationalIDHash?: string | null;
  PhoneNumber: string;
  FirstName: string;
  MiddleName?: string | null;
  LastName: string;
  Sex: "male" | "female";
  DateOfBirth: string;
  HomeRegion?: string | null;
  IsDeleted: boolean;
  DeletedAt?: string | null;
}

export interface Vital {
  ID: string;
  ReferralID: string;
  RecordedAt: string;
  SystolicBP: number;
  DiastolicBP: number;
  HeartRate: number;
  SpO2: number;
  Temperature: number;
  RespiratoryRate: number;
  GCSScore?: number | null;
}

export interface CodeInfo {
  Code: string;
  Description: string;
  Category: string;
}

export interface Diagnosis {
  ID: string;
  ReferralID: string;
  ICDCode: string;
  IsPrimary: boolean;
  DiagnosisCertainty: "SUSPECTED" | "CONFIRMED";
  CodeInfo: CodeInfo;
}

export interface ReferralForm {
  ID: string;
  ReferralID: string;
  ClinicalSummary: string;
  PatientHistory: string;
  PhysicalExaminationFindings?: string | null;
  InvestigationResults?: string | null;
  TreatmentGivenBeforeReferral?: string | null;
  MedicationOnTransfer?: string | null;
  ReasonOfReferral: string;
  ReasonForReferralCategory: string;
  ConditionAtReferral: string;
  ModeOfTransport?: string | null;
  AccompanyingPersonName?: string | null;
  AccompanyingPersonPhone?: string | null;
}

export interface EmergencyDetail {
  ID: string;
  ReferralID: string;
  EmergencyJustification: string;
}

export interface Referral {
  [key: string]: any;
  severity?: SeverityLevel;
}

export interface ReferralComment {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  createdAt: string;
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
  doctor_id: string;
  hospital_id: string;
}
