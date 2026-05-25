import type {
  ReceptionistArrivalStatus,
  ReceptionistReferral,
} from '@/types/receptionist';

/** List row from `GET /receptionist/referrals/triage-queue`. */
export interface ReceptionistTriageListItem {
  queue_id?: string;
  referral_id: string;
  patient_id?: string;
  patient_name?: string;
  appointment_date?: string | null;
  arrival_status?: string;
  referral_status?: string;
  department_id?: string;
  department_name?: string;
  has_doctor_assigned?: boolean;
  assigned_doctor_id?: string;
  assigned_doctor_name?: string;
  condition_at_referral?: string;
  created_at?: string;
}

export interface ReceptionistTriageListEnvelope {
  success?: boolean;
  data: ReceptionistReferral[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ReceptionistTriageQueryParams {
  page?: number;
  limit?: number;
  arrival_status?: ReceptionistArrivalStatus[];
  referral_status?: string[];
  has_doctor_assigned?: boolean;
  department_id?: string;
  patient_id?: string;
  national_id?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  include_terminal?: boolean;
}

export interface ReceptionistTriageAvailableActions {
  can_arrive?: boolean;
  can_miss?: boolean;
  can_assign_doctor?: boolean;
  can_revoke_doctor?: boolean;
  can_return_to_triage?: boolean;
}

export interface ReceptionistTriageDetail {
  referral_id: string;
  queue_id?: string;
  arrival_status: ReceptionistArrivalStatus | string;
  referral_status: string;
  appointment_date?: string | null;
  department_id?: string;
  department_name?: string;
  patient_first_name?: string;
  patient_last_name?: string;
  assigned_doctor_id?: string | null;
  assigned_doctor_name?: string | null;
  available_actions?: ReceptionistTriageAvailableActions;
  arrival_history?: Array<{
    status: string;
    at: string;
    actor?: string;
  }>;
}
