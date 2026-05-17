export interface ReceptionistReferral {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  dob?: string;
  referral_id: string;
  status: string;
  arrival_status?: "PENDING" | "ARRIVED" | "MISSED";
  scheduled_date?: string;
  scheduled_time?: string;
  eta?: string;
  arrival_time?: string;
  source_facility: string;
  referring_hospital_name?: string;
  urgency: string;
  department_name?: string;
  assigned_doctor_id?: string;
  assigned_doctor_name?: string;
  reason?: string;
  clinical_summary?: string;
  [key: string]: any;
}

export interface ReceptionistScheduleItem {
  id: string;
  referral_id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  scheduled_date: string;
  scheduled_time: string;
  department_name: string;
  urgency: string;
  arrival_status: "PENDING" | "ARRIVED" | "MISSED";
  source_facility?: string;
  [key: string]: any;
}

export interface AssignDoctorPayload {
  doctor_id: string;
}

export interface ReceptionistPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ReceptionistQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  arrival_status?: "PENDING" | "ARRIVED" | "MISSED";
  urgency?: string;
  department_id?: string;
}
