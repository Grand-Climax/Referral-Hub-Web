import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { RECEPTIONIST_ROUTES } from '@/config/api';
import {
  ReceptionistDoctorInfo,
  ReceptionistReferral,
  ReceptionistReferralDetail,
  ReceptionistPaginatedResponse,
  ReceptionistScheduleItem,
  AssignDoctorPayload,
  MarkMissedPayload,
  ReceptionistMissReason,
  ReceptionistOfflineDataResponse,
  ReceptionistQueryParams,
  RevokeDoctorPayload,
} from '@/types/receptionist';

interface ApiBaseResponse {
  message?: string;
  success?: boolean;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  if (value && typeof value === 'object') return value as UnknownRecord;
  return {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function splitDateTime(value?: string): { date?: string; time?: string } {
  if (!value) return {};
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return {};
  return {
    date: parsed.toISOString().split('T')[0],
    time: parsed.toTimeString().slice(0, 5),
  };
}

function normalizeArrivalStatus(value: unknown): ReceptionistReferral['arrival_status'] {
  const status = asString(value)?.toUpperCase();
  if (!status) return undefined;
  if (status === 'EXPECTED') return 'PENDING';
  if (status === 'PENDING') return 'PENDING';
  if (status === 'ARRIVED') return 'ARRIVED';
  if (status === 'ADMITTED') return 'ADMITTED';
  if (status === 'MISSED') return 'MISSED';
  return undefined;
}

function normalizeDoctor(raw: unknown): ReceptionistDoctorInfo {
  const record = asRecord(raw);
  return {
    id: asString(record.id) ?? '',
    first_name: asString(record.first_name) ?? '',
    last_name: asString(record.last_name) ?? '',
  };
}

function normalizeDoctorListResponse(raw: unknown): ReceptionistDoctorInfo[] {
  if (Array.isArray(raw)) return raw.map(normalizeDoctor).filter((doctor) => Boolean(doctor.id));
  const root = asRecord(raw);
  const doctors = Array.isArray(root.data) ? root.data : [];
  return doctors.map(normalizeDoctor).filter((doctor) => Boolean(doctor.id));
}

function normalizeScheduleItem(raw: unknown): ReceptionistScheduleItem {
  const queue = asRecord(raw);
  const referral = asRecord(queue.referral);
  const patient = asRecord(referral.patient);
  const department = asRecord(queue.department);
  const referralDepartment = asRecord(referral.target_department);
  const senderHospital = asRecord(referral.sender_hospital);
  const assignedDoctor = asRecord(queue.assigned_doctor);
  const dateTime = splitDateTime(asString(queue.appointment_date));
  const referralForm = asRecord(referral.referral_form);

  const id = asString(queue.id) ?? asString(queue.referral_id) ?? asString(referral.id) ?? '';
  const referralId = asString(queue.referral_id) ?? asString(referral.id) ?? id;
  const patientFirstName =
    asString(queue.patient_first_name) ??
    asString(referral.patient_first_name) ??
    asString(patient.first_name) ??
    '';
  const patientLastName =
    asString(queue.patient_last_name) ??
    asString(referral.patient_last_name) ??
    asString(patient.last_name) ??
    '';
  const assignedDoctorName =
    asString(queue.assigned_doctor_name) ??
    [asString(assignedDoctor.first_name), asString(assignedDoctor.last_name)]
      .filter(Boolean)
      .join(' ');

  return {
    id,
    referral_id: referralId,
    patient_first_name: patientFirstName,
    patient_last_name: patientLastName,
    patient_middle_name:
      asString(queue.patient_middle_name) ??
      asString(referral.patient_middle_name) ??
      asString(patient.middle_name),
    appointment_date: asString(queue.appointment_date),
    scheduled_date: asString(queue.scheduled_date) ?? dateTime.date,
    scheduled_time: asString(queue.scheduled_time) ?? dateTime.time,
    department_name:
      asString(queue.department_name) ??
      asString(department.name) ??
      asString(referralDepartment.name),
    urgency:
      asString(queue.urgency) ??
      asString(referral.urgency) ??
      asString(referralForm.urgency_level) ??
      'ROUTINE',
    arrival_status: normalizeArrivalStatus(queue.arrival_status) ?? 'PENDING',
    source_facility:
      asString(queue.source_facility) ??
      asString(queue.referring_hospital_name) ??
      asString(senderHospital.name),
    assigned_doctor_id: asString(queue.assigned_doctor_id),
    assigned_doctor_name: assignedDoctorName || undefined,
  };
}

function normalizeScheduleListResponse(raw: unknown): ReceptionistScheduleItem[] {
  if (Array.isArray(raw)) return raw.map(normalizeScheduleItem).filter((item) => Boolean(item.id));
  const root = asRecord(raw);
  const rootData = asRecord(root.data);
  if (Array.isArray(root.data)) {
    return root.data.map(normalizeScheduleItem).filter((item) => Boolean(item.id));
  }
  if (Array.isArray(rootData.data)) {
    return rootData.data.map(normalizeScheduleItem).filter((item) => Boolean(item.id));
  }
  if (Array.isArray(rootData.schedule)) {
    return rootData.schedule.map(normalizeScheduleItem).filter((item) => Boolean(item.id));
  }
  if (Array.isArray(root.schedule)) {
    return root.schedule.map(normalizeScheduleItem).filter((item) => Boolean(item.id));
  }
  return [];
}

function normalizeReferral(raw: unknown): ReceptionistReferral {
  const item = asRecord(raw);
  const referral = asRecord(item.referral);
  const patient = asRecord(item.patient);
  const nestedPatient = asRecord(referral.patient);
  const senderHospital = asRecord(item.sender_hospital);
  const nestedSenderHospital = asRecord(referral.sender_hospital);
  const department = asRecord(item.department);
  const targetDepartment = asRecord(item.target_department);
  const nestedTargetDepartment = asRecord(referral.target_department);
  const assignedDoctor = asRecord(item.assigned_doctor);
  const referralForm = asRecord(item.referral_form);
  const nestedReferralForm = asRecord(referral.referral_form);

  const derivedId =
    asString(item.id) ??
    asString(item.referral_id) ??
    asString(referral.id) ??
    '';
  const appointmentDateTime = splitDateTime(asString(item.appointment_date));
  const referralDateTime = splitDateTime(asString(referral.appointment_date));
  const dateTime =
    appointmentDateTime.date || appointmentDateTime.time
      ? appointmentDateTime
      : referralDateTime;
  const assignedDoctorName =
    asString(item.assigned_doctor_name) ??
    [asString(assignedDoctor.first_name), asString(assignedDoctor.last_name)]
      .filter(Boolean)
      .join(' ');

  return {
    id: derivedId,
    referral_id: asString(item.referral_id) ?? asString(referral.id) ?? derivedId,
    status: asString(item.status) ?? asString(referral.status) ?? 'UNKNOWN',
    urgency:
      asString(item.urgency) ??
      asString(referral.urgency) ??
      asString(referralForm.urgency_level) ??
      asString(nestedReferralForm.urgency_level) ??
      'ROUTINE',
    arrival_status:
      normalizeArrivalStatus(item.arrival_status) ??
      normalizeArrivalStatus(referral.arrival_status),
    patient_first_name:
      asString(item.patient_first_name) ??
      asString(referral.patient_first_name) ??
      asString(patient.first_name) ??
      asString(nestedPatient.first_name) ??
      '',
    patient_last_name:
      asString(item.patient_last_name) ??
      asString(referral.patient_last_name) ??
      asString(patient.last_name) ??
      asString(nestedPatient.last_name) ??
      '',
    patient_middle_name:
      asString(item.patient_middle_name) ??
      asString(referral.patient_middle_name) ??
      asString(patient.middle_name) ??
      asString(nestedPatient.middle_name),
    patient_region: asString(item.patient_region) ?? asString(referral.patient_region),
    dob:
      asString(item.dob) ??
      asString(item.date_of_birth) ??
      asString(patient.date_of_birth) ??
      asString(nestedPatient.date_of_birth),
    appointment_date: asString(item.appointment_date) ?? asString(referral.appointment_date),
    scheduled_date: asString(item.scheduled_date) ?? asString(referral.scheduled_date) ?? dateTime.date,
    scheduled_time: asString(item.scheduled_time) ?? asString(referral.scheduled_time) ?? dateTime.time,
    eta: asString(item.eta) ?? asString(referral.eta),
    arrival_time: asString(item.arrival_time) ?? asString(item.arrived_at),
    source_facility:
      asString(item.source_facility) ??
      asString(item.referring_hospital_name) ??
      asString(senderHospital.name) ??
      asString(nestedSenderHospital.name),
    referring_hospital_name:
      asString(item.referring_hospital_name) ??
      asString(senderHospital.name) ??
      asString(nestedSenderHospital.name),
    department_name:
      asString(item.department_name) ??
      asString(item.department) ??
      asString(department.name) ??
      asString(targetDepartment.name) ??
      asString(nestedTargetDepartment.name),
    assigned_doctor_id:
      asString(item.assigned_doctor_id) ?? asString(referral.assigned_doctor_id),
    assigned_doctor_name: assignedDoctorName || undefined,
    reason:
      asString(item.reason) ??
      asString(referralForm.reason_for_referral) ??
      asString(nestedReferralForm.reason_for_referral),
    clinical_summary:
      asString(item.clinical_summary) ??
      asString(referralForm.clinical_summary) ??
      asString(nestedReferralForm.clinical_summary),
    created_at: asString(item.created_at) ?? asString(referral.created_at),
    updated_at: asString(item.updated_at) ?? asString(referral.updated_at),
    patient_id: asString(item.patient_id) ?? asString(referral.patient_id),
  };
}

function normalizeReferralDetail(raw: unknown): ReceptionistReferralDetail {
  const root = asRecord(raw);
  const detail = root.data && typeof root.data === 'object' ? asRecord(root.data) : root;
  const normalized = normalizeReferral(detail);
  return {
    ...normalized,
    patient: asRecord(detail.patient) as ReceptionistReferralDetail['patient'],
    sender_hospital: asRecord(detail.sender_hospital) as ReceptionistReferralDetail['sender_hospital'],
    referral_form: asRecord(detail.referral_form) as ReceptionistReferralDetail['referral_form'],
  };
}

function normalizePaginatedReferrals(raw: unknown): ReceptionistPaginatedResponse<ReceptionistReferral> {
  if (Array.isArray(raw)) {
    return {
      data: raw.map(normalizeReferral).filter((item) => Boolean(item.id)),
      page: 1,
      limit: raw.length || 20,
      total: raw.length,
    };
  }

  const root = asRecord(raw);
  const rootData = asRecord(root.data);

  let list: unknown[] = [];
  if (Array.isArray(root.data)) {
    list = root.data;
  } else if (Array.isArray(root.referrals)) {
    list = root.referrals;
  } else if (Array.isArray(rootData.data)) {
    list = rootData.data;
  } else if (Array.isArray(rootData.referrals)) {
    list = rootData.referrals;
  }

  const normalizedData = list.map(normalizeReferral).filter((item) => Boolean(item.id));
  const page = Number(root.page ?? rootData.page ?? 1);
  const rawLimit = root.limit ?? root.page_size ?? rootData.limit ?? rootData.page_size;
  const limit = Number(rawLimit ?? 20);
  const total = Number(root.total ?? rootData.total ?? normalizedData.length);

  return {
    data: normalizedData,
    page: Number.isNaN(page) ? 1 : page,
    limit: Number.isNaN(limit) ? 20 : limit,
    total: Number.isNaN(total) ? normalizedData.length : total,
    message: asString(root.message) ?? asString(rootData.message),
    success:
      typeof root.success === 'boolean'
        ? root.success
        : typeof rootData.success === 'boolean'
          ? rootData.success
          : undefined,
  };
}

type MarkMissedArg = string | ({ id: string } & Partial<MarkMissedPayload>);

export const receptionistApi = createApi({
  reducerPath: 'receptionistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReceptionistReferral', 'ReceptionistSchedule', 'ReceptionistDoctor', 'ReceptionistOfflineData'],
  endpoints: (builder) => ({
    getDoctors: builder.query<ReceptionistDoctorInfo[], void>({
      query: () => RECEPTIONIST_ROUTES.DOCTORS,
      transformResponse: (raw: unknown) => normalizeDoctorListResponse(raw),
      providesTags: ['ReceptionistDoctor'],
    }),

    // List receptionist-visible referrals (hospital-scoped from token)
    getReferrals: builder.query<ReceptionistPaginatedResponse<ReceptionistReferral>, ReceptionistQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', String(params?.page ?? 1));
        queryParams.append('limit', String(params?.limit ?? params?.page_size ?? 20));

        if (params?.status) queryParams.append('status', params.status);
        if (params?.arrival_status) queryParams.append('arrival_status', params.arrival_status);
        if (params?.urgency) queryParams.append('urgency', params.urgency);
        if (params?.department_id) queryParams.append('department_id', params.department_id);
        if (params?.region) queryParams.append('region', params.region);
        if (params?.patient_id) queryParams.append('patient_id', params.patient_id);
        if (params?.national_id) queryParams.append('national_id', params.national_id);
        if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
        if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

        return `${RECEPTIONIST_ROUTES.LIST}?${queryParams.toString()}`;
      },
      transformResponse: (raw: unknown) => normalizePaginatedReferrals(raw),
      providesTags: ['ReceptionistReferral'],
    }),

    getMissedReferrals: builder.query<ReceptionistPaginatedResponse<ReceptionistReferral>, ReceptionistQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', String(params?.page ?? 1));
        queryParams.append('limit', String(params?.limit ?? params?.page_size ?? 20));
        return `${RECEPTIONIST_ROUTES.MISSED}?${queryParams.toString()}`;
      },
      transformResponse: (raw: unknown) => normalizePaginatedReferrals(raw),
      providesTags: ['ReceptionistReferral'],
    }),

    getOfflineData: builder.query<ReceptionistOfflineDataResponse, void>({
      query: () => RECEPTIONIST_ROUTES.OFFLINE_DATA,
      transformResponse: (raw: unknown) => {
        const root = asRecord(raw);
        const rootData = asRecord(root.data);
        const doctors = normalizeDoctorListResponse(root.doctors ?? rootData.doctors);
        const schedule = normalizeScheduleListResponse(root.schedule ?? rootData.schedule);
        return { doctors, schedule };
      },
      providesTags: ['ReceptionistOfflineData', 'ReceptionistSchedule', 'ReceptionistDoctor'],
    }),

    // View schedule (operational queue for next 48h)
    getSchedule: builder.query<ReceptionistScheduleItem[], void>({
      query: () => RECEPTIONIST_ROUTES.UPCOMING,
      transformResponse: (raw: unknown) => normalizeScheduleListResponse(raw),
      providesTags: ['ReceptionistSchedule'],
    }),

    // Get referral details (must belong to receptionist's hospital)
    getReferralById: builder.query<ReceptionistReferralDetail, string>({
      query: (id) => RECEPTIONIST_ROUTES.GET_BY_ID(id),
      transformResponse: (raw: unknown) => normalizeReferralDetail(raw),
      providesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }],
    }),

    // Confirm patient arrival (moves arrival_status to ARRIVED)
    markPatientArrival: builder.mutation<ApiBaseResponse, string>({
      query: (id) => ({
        url: RECEPTIONIST_ROUTES.ARRIVE(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ReceptionistReferral', id },
        'ReceptionistReferral',
        'ReceptionistSchedule',
        'ReceptionistOfflineData',
      ],
    }),

    // Assign treating doctor (only after arrival; doctor must be REFERRING_DOCTOR)
    assignDoctor: builder.mutation<ApiBaseResponse, { id: string } & AssignDoctorPayload>({
      query: ({ id, ...body }) => ({
        url: RECEPTIONIST_ROUTES.ASSIGN_DOCTOR(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ReceptionistReferral', id },
        'ReceptionistReferral',
        'ReceptionistSchedule',
        'ReceptionistOfflineData',
      ],
    }),

    // Mark missed appointment (sets arrival_status to MISSED)
    markMissed: builder.mutation<ApiBaseResponse, MarkMissedArg>({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg.id;
        const missReason =
          typeof arg === 'string' ? 'PATIENT_NO_SHOW' : arg.miss_reason ?? 'PATIENT_NO_SHOW';
        return {
          url: RECEPTIONIST_ROUTES.MISS(id),
          method: 'POST',
          body: {
            miss_reason: missReason as ReceptionistMissReason,
          },
        };
      },
      invalidatesTags: (result, error, arg) => [
        { type: 'ReceptionistReferral', id: typeof arg === 'string' ? arg : arg.id },
        'ReceptionistReferral',
        'ReceptionistSchedule',
        'ReceptionistOfflineData',
      ],
    }),

    revokeDoctor: builder.mutation<ApiBaseResponse, { id: string } & Partial<RevokeDoctorPayload>>({
      query: ({ id, reason }) => ({
        url: RECEPTIONIST_ROUTES.REVOKE_DOCTOR(id),
        method: 'POST',
        body: { reason: reason ?? 'Reassigned by receptionist' },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ReceptionistReferral', id },
        'ReceptionistReferral',
        'ReceptionistSchedule',
        'ReceptionistOfflineData',
      ],
    }),
  }),
});

export const {
  useGetDoctorsQuery,
  useGetReferralsQuery,
  useGetMissedReferralsQuery,
  useGetOfflineDataQuery,
  useGetScheduleQuery,
  useGetReferralByIdQuery,
  useMarkPatientArrivalMutation,
  useAssignDoctorMutation,
  useMarkMissedMutation,
  useRevokeDoctorMutation,
} = receptionistApi;
