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
