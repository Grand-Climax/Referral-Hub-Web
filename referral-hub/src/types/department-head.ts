// ─── Capacity Override Types ──────────────────────────────────────────────────

export interface CapacityOverride {
  id: string;
  hospital_id?: string;
  department_id?: string;
  target_date: string;
  new_limit: number;
  custom_limit?: number;
  reason: string;
  created_by?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCapacityOverrideRequest {
  target_date: string;
  new_limit: number;
  reason: string;
}

export interface UpdateCapacityOverrideRequest {
  new_limit: number;
  reason: string;
}

// ─── Daily Schedule Types ─────────────────────────────────────────────────────

export interface DailySchedule {
  id: string;
  hospital_id?: string;
  department_id?: string;
  schedule_date?: string;
  date?: string;
  booked_slots: number;
  max_slots: number;
  overbook_limit?: number;
  available_slots?: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Batch Scheduling Types ───────────────────────────────────────────────────

export interface BatchScheduleDetail {
  referral_id: string;
  patient_name: string;
  scheduled_for?: string;
  outcome: "SCHEDULED" | "SKIPPED";
  reason?: string;
}

export interface BatchSchedulingResponse {
  waiting_count?: number;
  scheduled_count?: number;
  skipped_count?: number;
  message?: string;
  details?: BatchScheduleDetail[];
  success?: boolean;
}

// ─── Dashboard Stats Types ────────────────────────────────────────────────────

export interface TodayCapacity {
  date: string;
  max_slots: number;
  overbook_limit: number;
  booked_slots: number;
  staff_capacity: number;
  staff_assigned: number;
  available_slots: number;
  is_full: boolean;
  has_override: boolean;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardStats {
  today_capacity: TodayCapacity | null;
  waiting_queue_size: number;
  oldest_waiting_days: number;
  scheduled_today: number;
  scheduled_next_7_days: number;
  missed_last_7_days: number;
  pending_referrals: number;
  completed_last_30_days: number;
  active_staff: number;
  active_overrides: number;
  status_counts: StatusCount[];
}

// ─── Trends Types ─────────────────────────────────────────────────────────────

export interface TrendEntry {
  date: string;
  max_slots: number;
  booked_slots: number;
  overbook_limit: number;
  available_slots: number;
  utilization: number;
  has_override: boolean;
}

// ─── Triage Queue Types (matches FRONTEND_TRIAGE_QUEUE.md contract) ───────────

export type ArrivalStatus = "EXPECTED" | "ARRIVED" | "ADMITTED" | "MISSED";
export type ReferralStatusEnum = "ACCEPTED" | "SCHEDULED";
export type Condition = "stable" | "urgent" | "critical";
export type TriageSortBy =
  | "composite_score"
  | "appointment_date"
  | "created_at";
export type TriageSortOrder = "asc" | "desc";

/** Filter set accepted by all three triage list endpoints (§3). */
export interface TriageQueueFilters {
  page?: number;
  /** Clamped 1..100 server-side, default 20. */
  limit?: number;
  /** Ignored by the dept-head endpoint (server forces caller's scope). */
  department_id?: string;
  arrival_status?: ArrivalStatus[];
  referral_status?: ReferralStatusEnum[];
  has_doctor_assigned?: boolean;
  patient_id?: string;
  national_id?: string;
  sort_by?: TriageSortBy;
  sort_order?: TriageSortOrder;
  /** Audit view — include terminal statuses. Default false. */
  include_terminal?: boolean;
}

/** A row in the triage list envelope (§4). */
export interface TriageListItem {
  queue_id: string;
  referral_id: string;
  patient_id: string;
  patient_name: string;
  composite_score: number;
  appointment_date: string | null;
  arrival_status: ArrivalStatus;
  referral_status: ReferralStatusEnum;
  condition_at_referral: Condition | "";
  department_id: string;
  department_name: string;
  has_doctor_assigned: boolean;
  assigned_doctor_id?: string;
  assigned_doctor_name?: string;
  created_at: string;
}

/** `dto.TriageListEnvelope` from the backend. */
export interface TriageListEnvelope {
  success: boolean;
  data: TriageListItem[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

/** Single timeline event from a triage detail (§5). */
export interface ArrivalHistoryEvent {
  at: string;
  event: string;
  description?: string;
  actor_id?: string;
  actor_name?: string;
}

/** Doctor block in the dept-head detail (no access dates). */
export interface TriageAssignedDoctor {
  user_id?: string;
  full_name?: string;
  email?: string;
}

/** Patient block in the dept-head detail (PII redacted: no national_id, no phone). */
export interface TriageDetailPatient {
  id?: string;
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  sex?: string;
  age_years?: number;
  home_region?: string;
}

/**
 * Available-actions flags from the detail response. For DEPT_HEAD they are
 * all `false` (read-only), but we type them strictly to mirror the contract
 * so the same type can be reused if the page ever proxies for another role.
 */
export interface TriageAvailableActions {
  schedule: boolean;
  emergency_schedule: boolean;
  return_to_triage: boolean;
  mark_arrived: boolean;
  mark_missed: boolean;
  assign_doctor: boolean;
  revoke_doctor: boolean;
}

/** Dept-head detail response payload (§5.3 — `TriageDetailDeptHeadResponse.data`). */
export interface TriageDetailDeptHead {
  queue_id: string;
  referral_id: string;
  arrival_status: ArrivalStatus;
  referral_status: ReferralStatusEnum;
  condition_at_referral: Condition | "";
  composite_score: number;
  appointment_date: string | null;
  department_id: string;
  department_name: string;
  has_doctor_assigned: boolean;
  assigned_doctor: TriageAssignedDoctor | null;
  patient: TriageDetailPatient;
  arrival_history: ArrivalHistoryEvent[];
  available_actions: TriageAvailableActions;
  created_at: string;
}

// ─── Legacy aliases (kept temporarily for non-migrated callers) ───────────────

/** @deprecated Use `TriageListItem` (matches the new contract). */
export type TriagePatient = TriageListItem & {
  /** Legacy "id" alias — server now returns `queue_id` + `referral_id`. */
  id?: string;
};

/** @deprecated Use `TriageListEnvelope`. */
export interface TriageQueueResponse {
  data: TriageListItem[];
  total: number;
  page?: number;
  limit?: number;
  has_more?: boolean;
  success?: boolean;
}

export interface BucketItem {
  label: string;
  count: number;
}

export interface TopWaiting {
  referral_id: string;
  patient_name: string;
  composite_score: number;
  waiting_days: number;
  created_at: string;
}

export interface PriorityBuckets {
  total_waiting: number;
  by_condition: BucketItem[];
  by_severity: BucketItem[];
  top_waiting: TopWaiting[];
}

// ─── Capacity Calendar Types ──────────────────────────────────────────────────

export interface CalendarDayEntry {
  date: string;
  max_slots: number;
  overbook_limit: number;
  booked_slots: number;
  available_slots: number;
  is_full: boolean;
  has_override: boolean;
}

export interface CapacityDetail {
  date: string;
  max_slots: number;
  overbook_limit: number;
  booked_slots: number;
  staff_capacity: number;
  staff_assigned: number;
  available_slots: number;
  is_full: boolean;
  has_override: boolean;
}

// ─── Scheduled Patients ───────────────────────────────────────────────────────

export interface ScheduledPatient {
  id: string;
  referral_id: string;
  arrival_status: "EXPECTED" | "ARRIVED" | "ADMITTED" | "MISSED";
  assigned_doctor_id?: string;
  composite_score?: number;
  appointment_date?: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
  referral?: {
    patient?: {
      first_name: string;
      last_name: string;
    };
  };
}

// ─── Daily Capacity Baseline ──────────────────────────────────────────────────

export interface DailyCapacityBaseline {
  hospital_id?: string;
  department_id?: string;
  standard_daily_limit: number;
  overbook_limit: number;
  updated_at?: string;
  success?: boolean;
}

export interface UpdateDailyCapacityBaselineRequest {
  standard_daily_limit: number;
  overbook_limit: number;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccessResponse {
  message?: string;
  success?: boolean;
  data?: unknown;
}
