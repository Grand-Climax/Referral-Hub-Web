// Response from GET /api/v1/receptionist (list referrals)
export interface ReceptionistReferral {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  patient_region?: string;
  condition_at_referral?: string;
  diagnosis?: string;
  icd_code?: string;
  department?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Response from GET /api/v1/receptionist/schedule
export interface ReceptionistScheduleItem {
  id: string;
  referral_id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  scheduled_time?: string;
  arrival_status?: string;
  queue_status?: string;
  department?: string;
  urgency?: string;
  [key: string]: any;
}

// Payload for POST /api/v1/receptionist/walk-in
export interface ReceptionistWalkInPayload {
  referral_id: string;
}

// Payload for POST /api/v1/receptionist/{id}/assign-doctor
export interface AssignDoctorPayload {
  doctor_id: string;
}

// Payload for POST /api/v1/receptionist/{id}/miss
export interface MarkMissedPayload {
  miss_reason: "PATIENT_NO_SHOW" | "CANCELLED" | "OTHER";
}

// Paginated response structure
export interface ReceptionistPaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
  success: boolean;
  message?: string;
}

// Detailed referral response from GET /api/v1/receptionist/{id}
export interface ReceptionistReferralDetail {
  id: string;
  patient_id: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    date_of_birth: string;
    sex: string;
    phone_number?: string;
    national_id?: string;
    home_region?: string;
    allow_sms?: boolean;
  };
  sender_hospital_id: string;
  sender_hospital: {
    id: string;
    name: string;
    address?: string;
    contact_phone?: string;
    region?: string;
    tier_level: string;
  };
  target_hospital_id: string;
  receiver_hospital: {
    id: string;
    name: string;
    address?: string;
    contact_phone?: string;
    region?: string;
    tier_level: string;
  };
  target_dept_id: string;
  target_department: {
    id: string;
    name: string;
    description?: string;
  };
  referring_doctor_id: string;
  liaison_officer_id?: string;
  specialist_id?: string;
  status: string;
  triage_status?: string;
  referral_form?: {
    id: string;
    referral_id: string;
    reason_of_referral?: string;
    reason_for_referral_category?: string;
    clinical_summary?: string;
    patient_history?: string;
    physical_examination_findings?: string;
    investigation_results?: string;
    treatment_given_before_referral?: string;
    medication_on_transfer?: string;
    condition_at_referral?: string;
    mode_of_transport?: string;
    accompanying_person_name?: string;
    accompanying_person_phone?: string;
  };
  diagnoses?: Array<{
    id: string;
    referral_id: string;
    icd_code: string;
    is_primary: boolean;
    diagnosis_certainty: string;
    code_info?: {
      code: string;
      description: string;
      category: string;
    };
  }>;
  vitals?: Array<{
    id: string;
    referral_id: string;
    recorded_at: string;
    systolic_bp?: number;
    diastolic_bp?: number;
    heart_rate?: number;
    respiratory_rate?: number;
    temperature?: number;
    sp_o2?: number;
    gcs_score?: number;
  }>;
  attachments?: Array<{
    id: string;
    referral_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    storage_path: string;
    category?: string;
    uploaded_at: string;
    verification?: string;
  }>;
  redirections?: Array<{
    id: string;
    referral_id: string;
    redirected_from_hospital_id: string;
    redirected_from_hospital_name?: string;
    redirected_to_hospital_id: string;
    redirected_to_hospital_name?: string;
    redirection_reason?: string;
    redirected_by_specialist_id?: string;
    created_at: string;
  }>;
  emergency_detail?: {
    id: string;
    referral_id: string;
    emergency_justification?: string;
    admitted_at?: string;
  };
  ml_severity_score?: number;
  ml_status?: string;
  ml_last_error?: string;
  ml_retry_count?: number;
  waiting_hours_weight?: number;
  rejection_reason?: string;
  revision_reason?: string;
  is_archived: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
  success: boolean;
  message?: string;
}

// Query parameters for GET /api/v1/receptionist
export interface ReceptionistListParams {
  page?: number;
  limit?: number;
  status?: string;
  region?: string;
  patient_name?: string;
  sort?: "asc" | "desc";
}
