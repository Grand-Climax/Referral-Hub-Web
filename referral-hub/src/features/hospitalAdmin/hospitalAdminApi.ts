import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { HOSPITAL_ADMIN_ROUTES } from '@/config/api';
import {
  HospitalAdminStaff,
  HospitalAdminStaffDetail,
  HospitalAdminStaffResponse,
  GetStaffParams,
  CreateStaffPayload,
  ReplaceStaffPayload,
  ChangeRolePayload,
  UpdateStaffPayload,
  ReferralStatusHistory,
  HospitalAdminAuditLog,
  AcceptanceRejectionReport,
  AverageWaitTimeReport,
  BusiestDepartmentRow,
  MissedAppointmentReport,
  MonthlyReferralRow,
  TopReferringHospitalRow,
  GetAuditLogsParams,
  HospitalAdminAuditLogListResponse,
} from '@/types/hospital-admin';

function unwrapStaffDetail(
  raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail },
): HospitalAdminStaffDetail {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
    return raw.data;
  }
  return raw as HospitalAdminStaffDetail;
}

function buildStaffListQuery(params?: GetStaffParams): string {
  const searchParams = new URLSearchParams();
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 50;
  searchParams.set('page', String(page));
  searchParams.set('page_size', String(pageSize));
  if (params?.role) searchParams.set('role', params.role);
  if (params?.name) searchParams.set('name', params.name);
  if (params?.email) searchParams.set('email', params.email);
  if (params?.dept_id) searchParams.set('dept_id', params.dept_id);
  if (typeof params?.is_active === 'boolean') {
    searchParams.set('is_active', String(params.is_active));
  }
  return `${HOSPITAL_ADMIN_ROUTES.STAFF}?${searchParams.toString()}`;
}

function buildAuditLogsQuery(params?: GetAuditLogsParams): string {
  const searchParams = new URLSearchParams();
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 20;
  searchParams.set('page', String(page));
  searchParams.set('page_size', String(pageSize));
  if (params?.action_type?.trim()) searchParams.set('action_type', params.action_type.trim());
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  return `${HOSPITAL_ADMIN_ROUTES.AUDIT_LOGS}?${searchParams.toString()}`;
}

function unwrapAuditLogsResponse(raw: unknown): HospitalAdminAuditLogListResponse {
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    const o = raw as Record<string, unknown>;
    const data = o.data as HospitalAdminAuditLog[];
    const page = typeof o.page === 'number' ? o.page : Number(o.page) || 1;
    const totalRaw = o.total ?? o.total_count;
    const total =
      typeof totalRaw === 'number'
        ? totalRaw
        : totalRaw != null
          ? Number(totalRaw)
          : data.length;
    return {
      data,
      page,
      total: Number.isFinite(total) ? total : data.length,
      success: typeof o.success === 'boolean' ? o.success : undefined,
      message: typeof o.message === 'string' ? o.message : undefined,
    };
  }
  if (Array.isArray(raw)) {
    return { data: raw as HospitalAdminAuditLog[], page: 1, total: raw.length };
  }
  return { data: [], page: 1, total: 0 };
}

function unwrapReportArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: T[] }).data;
  }
  return [];
}

function unwrapAcceptanceRejection(raw: unknown): AcceptanceRejectionReport {
  if (raw && typeof raw === 'object' && 'acceptance_rate' in raw) {
    return raw as AcceptanceRejectionReport;
  }
  return { acceptance_rate: 0, rejection_rate: 0 };
}

function unwrapAverageWaitTime(raw: unknown): AverageWaitTimeReport {
  if (raw && typeof raw === 'object' && 'average_wait_time' in raw) {
    return raw as AverageWaitTimeReport;
  }
  return { average_wait_time: 0 };
}

function unwrapMissedAppointment(raw: unknown): MissedAppointmentReport {
  if (raw && typeof raw === 'object' && 'missed_appointment_rate' in raw) {
    return raw as MissedAppointmentReport;
  }
  return { missed_appointment_rate: 0 };
}

export const hospitalAdminApi = createApi({
  reducerPath: 'hospitalAdminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['HospitalAdminStaff', 'ReferralStatusHistory', 'HospitalAdminAudit'],
  endpoints: (builder) => ({
    getStaff: builder.query<HospitalAdminStaffResponse, GetStaffParams | undefined>({
      query: (params) => buildStaffListQuery(params),
      providesTags: ['HospitalAdminStaff'],
    }),
    getStaffById: builder.query<HospitalAdminStaffDetail, string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
      transformResponse: (raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail }) =>
        unwrapStaffDetail(raw),
      providesTags: (result, error, id) => [{ type: 'HospitalAdminStaff', id }],
    }),
    updateStaff: builder.mutation<
      HospitalAdminStaffDetail,
      { id: string } & UpdateStaffPayload
    >({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail }) =>
        unwrapStaffDetail(raw),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    updateStaffActivation: builder.mutation<unknown, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_ACTIVATION(id),
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    createStaff: builder.mutation<HospitalAdminStaff, CreateStaffPayload>({
      query: (body) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HospitalAdminStaff'],
    }),
    deleteStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['HospitalAdminStaff'],
    }),
    replaceStaff: builder.mutation<HospitalAdminStaff, { id: string } & ReplaceStaffPayload>({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.REPLACE_STAFF(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    changeStaffRole: builder.mutation<HospitalAdminStaff, { id: string } & ChangeRolePayload>({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.CHANGE_ROLE(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    getReferralStatusHistory: builder.query<ReferralStatusHistory[], string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.STATUS_HISTORY(id),
      providesTags: (result, error, id) => [{ type: 'ReferralStatusHistory', id }],
    }),
    getAuditLogs: builder.query<HospitalAdminAuditLogListResponse, GetAuditLogsParams | void>({
      query: (params) => buildAuditLogsQuery(params ?? undefined),
      transformResponse: (raw: unknown) => unwrapAuditLogsResponse(raw),
      providesTags: ['HospitalAdminAudit'],
    }),
    getAcceptanceRejectionRate: builder.query<AcceptanceRejectionReport, void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REPORTS_ACCEPTANCE_REJECTION_RATE,
      transformResponse: (raw: unknown) => unwrapAcceptanceRejection(raw),
    }),
    getAverageWaitTime: builder.query<AverageWaitTimeReport, void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REPORTS_AVERAGE_WAIT_TIME,
      transformResponse: (raw: unknown) => unwrapAverageWaitTime(raw),
    }),
    getBusiestDepartments: builder.query<BusiestDepartmentRow[], void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REPORTS_BUSIEST_DEPARTMENTS,
      transformResponse: (raw: unknown) => unwrapReportArray<BusiestDepartmentRow>(raw),
    }),
    getMissedAppointmentRate: builder.query<MissedAppointmentReport, void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REPORTS_MISSED_APPOINTMENT_RATE,
      transformResponse: (raw: unknown) => unwrapMissedAppointment(raw),
    }),
    getMonthlyReferrals: builder.query<MonthlyReferralRow[], void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REPORTS_MONTHLY_REFERRALS,
      transformResponse: (raw: unknown) => unwrapReportArray<MonthlyReferralRow>(raw),
    }),
    getTopReferringHospitals: builder.query<TopReferringHospitalRow[], void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REPORTS_TOP_REFERRING_HOSPITALS,
      transformResponse: (raw: unknown) => unwrapReportArray<TopReferringHospitalRow>(raw),
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateStaffActivationMutation,
  useDeleteStaffMutation,
  useReplaceStaffMutation,
  useChangeStaffRoleMutation,
  useGetReferralStatusHistoryQuery,
  useGetAuditLogsQuery,
  useGetAcceptanceRejectionRateQuery,
  useGetAverageWaitTimeQuery,
  useGetBusiestDepartmentsQuery,
  useGetMissedAppointmentRateQuery,
  useGetMonthlyReferralsQuery,
  useGetTopReferringHospitalsQuery,
} = hospitalAdminApi;
