export type ReceptionistArrivalStatus =
  | "EXPECTED"
  | "PENDING"
  | "ARRIVED"
  | "ADMITTED"
  | "MISSED";

export type ReceptionistMissReason =
  | "PATIENT_NO_SHOW"
  | "PATIENT_CONTACTED_RESCHEDULE"
  | "HOSPITAL_CANCELLED"
  | "HOSPITAL_CAPACITY_ISSUE";

export interface ReceptionistDoctorInfo {
  id: string;
  first_name: string;
  last_name: string;
  department_id?: string;
}

export interface ReceptionistDoctorsQueryParams {
  /** Target department for the referral — limits assignable treating doctors. */
  department_id?: string;
}

export interface ReceptionistReferral {
  id: string;
  referral_id: string;
  status: string;
  urgency: string;
  arrival_status?: ReceptionistArrivalStatus;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  patient_region?: string;
  dob?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  appointment_date?: string;
  eta?: string;
  arrival_time?: string;
  source_facility?: string;
  referring_hospital_name?: string;
  department_id?: string;
  department_name?: string;
  assigned_doctor_id?: string;
  assigned_doctor_name?: string;
  reason?: string;
  clinical_summary?: string;
  created_at?: string;
  updated_at?: string;
  patient_id?: string;
}

export interface ReceptionistReferralDetail extends ReceptionistReferral {
  patient?: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    date_of_birth?: string;
  };
  sender_hospital?: {
    name?: string;
  };
  referral_form?: {
    reason_for_referral?: string;
    clinical_summary?: string;
    urgency_level?: string;
  };
}

export interface ReceptionistScheduleItem {
  id: string;
  referral_id: string;
  status?: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  appointment_date?: string;
  department_id?: string;
  department_name?: string;
  urgency: string;
  arrival_status: ReceptionistArrivalStatus;
  source_facility?: string;
  assigned_doctor_id?: string;
  assigned_doctor_name?: string;
}

export interface ReceptionistOfflineDataResponse {
  doctors: ReceptionistDoctorInfo[];
  schedule: ReceptionistScheduleItem[];
}

export interface AssignDoctorPayload {
  doctor_id: string;
  reason?: string;
}

export interface MarkMissedPayload {
  miss_reason: ReceptionistMissReason;
}

export interface RevokeDoctorPayload {
  reason: string;
}

export interface ReceptionistPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  message?: string;
  success?: boolean;
}

/** Maps UI arrival filter values to backend query tokens. */
export function receptionistArrivalFilterForApi(
  status: ReceptionistArrivalStatus,
): string {
  if (status === 'PENDING') return 'EXPECTED';
  return status;
}

export interface ReceptionistQueryParams {
  page?: number;
  limit?: number;
  page_size?: number;
  status?: string;
  referral_status?: string;
  arrival_status?: ReceptionistArrivalStatus;
  has_doctor_assigned?: boolean;
  urgency?: string;
  department_id?: string;
  region?: string;
  patient_id?: string;
  national_id?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
