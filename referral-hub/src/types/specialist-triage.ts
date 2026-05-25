/**
 * Specialist triage queue & scheduling DTOs.
 *
 * Matches the backend contracts described in
 *   • FRONTEND_TRIAGE_QUEUE.md   (list + detail envelope, common enums)
 *   • FRONTEND_SCHEDULE_OVERRIDE.md (Schedule + Emergency Schedule + Return-to-Triage)
 *
 * Shared shape enums (ArrivalStatus, ReferralStatus, Condition, sort enums,
 * list envelope, list item, arrival-history event) are re-exported from
 * `@/types/department-head` to avoid duplicating tiny literal-union types.
 * Keeping them in one place means a contract change only needs to flip one
 * file rather than chasing duplicates across roles.
 */

export type {
  ArrivalStatus,
  ReferralStatusEnum,
  Condition,
  TriageSortBy,
  TriageSortOrder,
  TriageQueueFilters,
  TriageListItem,
  TriageListEnvelope,
  ArrivalHistoryEvent,
} from './department-head';

import type {
  ArrivalStatus,
  ReferralStatusEnum,
  Condition,
  ArrivalHistoryEvent,
} from './department-head';

// ─── Specialist detail — §5.1 of FRONTEND_TRIAGE_QUEUE.md ───────────────────

/**
 * Patient block in the *specialist* detail. Specialists DO see PII
 * (`national_id`, `phone_number`) — dept-heads do not.
 */
export interface TriageDetailSpecialistPatient {
  id?: string;
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  sex?: string;
  age_years?: number;
  home_region?: string;
  national_id?: string;
  phone_number?: string;
}

export interface TriageVitals {
  recorded_at?: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  heart_rate?: number;
  sp_o2?: number;
  temperature?: number;
  respiratory_rate?: number;
  gcs_score?: number;
}

export interface TriageDiagnosis {
  icd_code: string;
  description?: string;
  is_primary?: boolean;
  diagnosis_certainty?: string;
}

export interface TriageAccessGrant {
  user_id: string;
  full_name?: string;
  email?: string;
  /** TREATING_DOCTOR | CONSULTED_DOCTOR | … */
  access_type?: string;
  granted_at?: string;
  granted_by?: string;
  revoked_at?: string | null;
  revoke_reason?: string;
}

/** Available actions for a specialist on a triage row (§3 of override guide). */
export interface SpecialistAvailableActions {
  schedule: boolean;
  emergency_schedule: boolean;
  return_to_triage: boolean;
  /** Defensive — server might return these even though specialists never use them. */
  mark_arrived?: boolean;
  mark_missed?: boolean;
  assign_doctor?: boolean;
  revoke_doctor?: boolean;
}

/** Full payload of `GET /api/v1/specialist/referrals/{id}/triage-detail`. */
export interface TriageDetailSpecialist {
  queue_id: string;
  referral_id: string;
  arrival_status: ArrivalStatus;
  referral_status: ReferralStatusEnum;
  condition_at_referral: Condition | '' | string;
  composite_score: number;
  ml_severity_score?: number | null;
  triage_status?: string;
  appointment_date: string | null;
  department_id: string;
  department_name: string;
  created_at: string;

  patient: TriageDetailSpecialistPatient;
  vitals?: TriageVitals | null;
  diagnoses?: TriageDiagnosis[];

  clinical_summary?: string;
  reason_of_referral?: string;
  investigation_results?: string;

  treating_doctor?: TriageAccessGrant | null;
  consulting_doctors?: TriageAccessGrant[];
  /** Full access ledger — both active and revoked grants. */
  referral_access_list?: TriageAccessGrant[];

  arrival_history?: ArrivalHistoryEvent[];
  available_actions: SpecialistAvailableActions;
}

// ─── Schedule options (§5 of override guide) ────────────────────────────────

export interface ScheduleOption {
  /** YYYY-MM-DD */
  date: string;
  max_slots: number;
  booked_slots: number;
  /** max_slots - booked_slots, floored at 0 */
  available_slots: number;
  overbook_limit: number;
  /** True when a CapacityOverride is active on that day. */
  has_override: boolean;
}

export interface ScheduleOptionsResponse {
  data?: ScheduleOption[];
  options?: ScheduleOption[];
  success?: boolean;
  message?: string;
}

// ─── Schedule + Emergency Schedule requests / responses ────────────────────

/**
 * Routine schedule body. `appointment_date` is **RFC3339** for this endpoint.
 */
export interface ScheduleRequest {
  /** RFC3339 timestamp, e.g. "2026-05-30T00:00:00Z". */
  appointment_date: string;
  notes?: string;
  /** Ignored by the server — kept only for legacy compat. */
  override?: boolean;
}

/**
 * Emergency override body. `appointment_date` is **YYYY-MM-DD** (date only)
 * — different from the routine endpoint by design (see §2.2 of the guide).
 */
export interface EmergencyScheduleRequest {
  /** YYYY-MM-DD only — NOT a full timestamp. */
  appointment_date: string;
  /**
   * Required UNLESS `condition_at_referral.toLowerCase().trim() === 'critical'`.
   * The FE should prefix the reason category before the free-text justification.
   */
  justification: string;
}

export interface ScheduleSuccessResponse {
  success: true;
  message: string;
  /** True iff the patient was MISSED before this call and just got rescued. */
  rescheduled_from_missed: boolean;
}

export interface ReturnToTriageRequest {
  /** Why the specialist is sending this row back to the queue. */
  reason: string;
}
