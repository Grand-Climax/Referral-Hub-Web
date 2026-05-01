export interface ReceptionistReferral {
  id: string;
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  dob?: string;
  referral_id: string;
  status: string;
  eta?: string;
  arrival_time?: string;
  source_facility: string;
  urgency: string;
  [key: string]: any;
}

export interface ReceptionistScheduleItem {
  id: string;
  time: string;
  patient_name: string;
  status: string;
  [key: string]: any;
}

export interface ReceptionistWalkInPayload {
  patient_first_name: string;
  patient_last_name: string;
  patient_middle_name?: string;
  dob: string;
  reason: string;
  urgency: string;
  [key: string]: any;
}

export interface AssignDoctorPayload {
  doctor_id: string;
  [key: string]: any;
}

export interface ReceptionistPaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}
