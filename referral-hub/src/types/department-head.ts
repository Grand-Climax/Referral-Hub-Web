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

// ─── Triage Queue Types ───────────────────────────────────────────────────────

export interface TriagePatient {
  id: string;
  referral_id?: string;
  patient_name: string;
  patient_age?: number;
  patient_sex?: string;
  urgency_level?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  severity_score?: number;
  composite_score?: number;
  arrival_status?: string;
  assigned_doctor_id?: string;
  appointment_date?: string;
  waiting_days?: number;
  referring_facility?: string;
  estimated_arrival?: string;
  status?: string;
  created_at: string;
}

export interface TriageQueueResponse {
  data: TriagePatient[];
  total: number;
  page?: number;
  page_size?: number;
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

// ─── Staff Types ──────────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  profile_image?: string;
}

export interface StaffCounts {
  active: number;
  inactive: number;
  total: number;
}

export interface StaffSummary {
  department: string;
  doctors: StaffCounts;
  receptionists: StaffCounts;
  doctors_assigned_today: number;
  staff_capacity_hint: number;
  members: StaffMember[];
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

// ─── Activity Feed Types ──────────────────────────────────────────────────────

export interface ActivityEntry {
  id: string;
  timestamp: string;
  action_type: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  summary: string;
  new_value?: {
    result?: {
      scheduled_count?: number;
      skipped_count?: number;
    };
    referral_id?: string;
    [key: string]: unknown;
  };
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccessResponse {
  message?: string;
  success?: boolean;
  data?: unknown;
}
