export type ClinicalUpdateReason =
  | 'SPECIALIST_NOTE'
  | 'CONDITION_CHANGE'
  | 'MISSED_APPOINTMENT_RE_EVALUATION';

export type ReferralOutcome =
  | 'improved'
  | 'deteriorated'
  | 'discharged'
  | 'transferred'
  | 'deceased';

export interface ClinicalUpdatePayload {
  update_reason: ClinicalUpdateReason;
  clinical_notes: string;
}

export interface ClinicalUpdateRecord {
  id: string;
  referral_id: string;
  update_reason: string;
  clinical_notes: string;
  requires_review?: boolean;
  created_at: string;
  author_id?: string;
  author_name?: string;
}

export interface RecordOutcomePayload {
  outcome: ReferralOutcome;
  length_of_stay_days?: number;
  was_referral_appropriate?: boolean | null;
  outcome_notes?: string;
}

export interface MarkDeceasedPayload {
  reason: string;
}

export type DoctorAccessType = 'TREATING_DOCTOR' | 'CONSULTED_DOCTOR';

export interface AssignedReferralRow {
  id: string;
  patient_id: string;
  patient_name: string;
  status: string;
  target_hospital: string;
  target_department: string;
  created_at: string;
  access_type: DoctorAccessType;
  access_granted_at: string;
  access_revoked_at: string | null;
}

export interface AccessGrantRow {
  user_id: string;
  full_name?: string;
  email?: string;
  access_type?: string;
  granted_at?: string;
  granted_by?: string;
  granted_by_name?: string;
  revoked_at?: string | null;
  revoke_reason?: string;
}
