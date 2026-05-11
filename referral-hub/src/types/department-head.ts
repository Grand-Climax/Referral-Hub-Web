// ─── Capacity Override Types ──────────────────────────────────────────────────

export interface CapacityOverride {
  id: string;
  target_date: string; // YYYY-MM-DD format
  new_limit: number;
  reason: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCapacityOverrideRequest {
  target_date: string; // YYYY-MM-DD format
  new_limit: number;
  reason: string;
  dept_id?: string; // Optional - backend may derive from auth token
}

export interface UpdateCapacityOverrideRequest {
  new_limit: number;
  reason: string;
}

export interface CapacityOverridesResponse {
  data: CapacityOverride[];
  success: boolean;
}

// ─── Schedule Types ───────────────────────────────────────────────────────────

export interface DailySchedule {
  id: string;
  date: string; // YYYY-MM-DD format
  max_slots: number;
  booked_slots: number;
  available_slots: number;
  department_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleResponse {
  data: DailySchedule[];
  success: boolean;
}

export interface UpdateMaxSlotsRequest {
  max_slots: number;
}

export interface BatchSchedulingResponse {
  message: string;
  scheduled_count?: number;
  success: boolean;
}

// ─── Triage Queue Types ───────────────────────────────────────────────────────

export interface TriagePatient {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_sex: string;
  urgency_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; // Optional - may not always be present
  severity_score?: number; // Optional - may not always be present
  referring_facility: string;
  estimated_arrival?: string;
  status: string;
  created_at: string;
}

export interface TriageQueueResponse {
  data: TriagePatient[];
  total: number;
  success: boolean;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccessResponse {
  message: string;
  success: boolean;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  success: boolean;
}
