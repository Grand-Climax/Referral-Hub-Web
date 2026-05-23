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
  HospitalAdminDepartment,
  AddHospitalDepartmentPayload,
  UpdateDepartmentActivationPayload,
  AssignDepartmentHeadPayload,
  HospitalAdminProfile,
  UpdateHospitalAdminProfilePayload,
  GetHospitalAdminReferralsParams,
  ReferralStatsByStatus,
  ReferralStatsByStatusRow,
  StaffSessionListResponse,
  ReassignStaffDepartmentPayload,
  HospitalReferralLogResponse,
  HospitalReferralLogEntry,
} from '@/types/hospital-admin';
import { Referral } from '@/types/referral';
import { ReferralListPaginatedResponse } from '@/types/referral-list';

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

function unwrapDataArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: T[] }).data;
  }
  return [];
}

type HospitalAdminDepartmentRaw = {
  id: string;
  hospital_id?: string;
  department_id?: string;
  department?: {
    id?: string;
    name?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  name?: string;
  description?: string;
  standard_daily_limit?: number;
  daily_limit?: number;
  is_active?: boolean;
  head_user_id?: string | null;
  head_name?: string | null;
  head_email?: string | null;
  created_at?: string;
  updated_at?: string;
};

function normalizeHospitalDepartment(raw: HospitalAdminDepartmentRaw): HospitalAdminDepartment {
  const nested = raw.department;
  const departmentId = raw.department_id ?? nested?.id ?? '';
  return {
    id: raw.id,
    hospital_id: raw.hospital_id,
    department_id: departmentId,
    department: nested
      ? {
          id: nested.id ?? departmentId,
          name: nested.name ?? '',
          description: nested.description,
          created_at: nested.created_at,
          updated_at: nested.updated_at,
        }
      : undefined,
    name: nested?.name ?? raw.name ?? 'Unknown department',
    description: nested?.description ?? raw.description,
    standard_daily_limit: raw.standard_daily_limit ?? raw.daily_limit,
    is_active: raw.is_active,
    head_user_id: raw.head_user_id,
    head_name: raw.head_name,
    head_email: raw.head_email,
    created_at: raw.created_at ?? nested?.created_at,
    updated_at: raw.updated_at ?? nested?.updated_at,
  };
}

function unwrapHospitalDepartments(raw: unknown): HospitalAdminDepartment[] {
  return unwrapDataArray<HospitalAdminDepartmentRaw>(raw).map(normalizeHospitalDepartment);
}

function unwrapObject<T extends object>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function unwrapHospitalDepartmentObject(raw: unknown): HospitalAdminDepartment {
  const obj = unwrapObject<HospitalAdminDepartmentRaw>(raw);
  return normalizeHospitalDepartment(obj);
}

function buildReferralsQuery(
  baseUrl: string,
  params?: GetHospitalAdminReferralsParams,
): string {
  const searchParams = new URLSearchParams();
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? params?.limit ?? 10;
  searchParams.set('page', String(page));
  searchParams.set('page_size', String(pageSize));
  if (params?.status?.trim()) searchParams.set('status', params.status.trim());
  return `${baseUrl}?${searchParams.toString()}`;
}

function unwrapReferralsList(raw: unknown): ReferralListPaginatedResponse {
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const data = Array.isArray(o.data) ? o.data : [];
    return {
      data,
      page: Number(o.page ?? 1),
      page_size: Number(o.page_size ?? o.limit ?? 10),
      total: Number(o.total ?? data.length),
    };
  }
  return { data: [], page: 1, page_size: 10, total: 0 };
}

function unwrapReferralLogEntry(raw: unknown): HospitalReferralLogEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const historyId = String(o.history_id ?? o.id ?? '');
  const referralId = String(o.referral_id ?? '');
  if (!historyId && !referralId) return null;
  return {
    history_id: historyId,
    referral_id: referralId,
    changed_by_id: String(o.changed_by_id ?? o.changed_by ?? ''),
    role: String(o.role ?? ''),
    from_status: String(o.from_status ?? o.status ?? ''),
    to_status: String(o.to_status ?? o.status ?? ''),
    created_at: String(o.created_at ?? ''),
  };
}

function unwrapReferralsLog(raw: unknown): HospitalReferralLogResponse {
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const data = Array.isArray(o.data)
      ? o.data
          .map(unwrapReferralLogEntry)
          .filter((row): row is HospitalReferralLogEntry => row != null)
      : [];
    return {
      data,
      page: Number(o.page ?? 1),
      page_size: Number(o.page_size ?? 20),
      total: Number(o.total ?? data.length),
      success: typeof o.success === 'boolean' ? o.success : undefined,
      message: typeof o.message === 'string' ? o.message : undefined,
    };
  }
  if (Array.isArray(raw)) {
    const data = raw
      .map(unwrapReferralLogEntry)
      .filter((row): row is HospitalReferralLogEntry => row != null);
    return { data, page: 1, page_size: data.length || 20, total: data.length };
  }
  return { data: [], page: 1, page_size: 20, total: 0 };
}

function unwrapReferralStatusHistory(raw: unknown): ReferralStatusHistory[] {
  if (Array.isArray(raw)) {
    return raw
      .map(unwrapReferralLogEntry)
      .filter((row): row is ReferralStatusHistory => row != null);
  }
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return unwrapReferralStatusHistory((raw as { data: unknown }).data);
  }
  return [];
}

function unwrapReferralStats(raw: unknown): ReferralStatsByStatusRow[] {
  if (Array.isArray(raw)) {
    return raw.map((row) => {
      if (row && typeof row === 'object' && 'status' in row && 'count' in row) {
        return row as ReferralStatsByStatusRow;
      }
      return { status: String(row), count: 0 };
    });
  }
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return unwrapReferralStats((raw as { data: unknown }).data);
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, number>).map(([status, count]) => ({
      status,
      count: Number(count) || 0,
    }));
  }
  return [];
}

function unwrapStaffSessions(raw: unknown): StaffSessionListResponse {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const o = raw as Record<string, unknown>;
    const data = Array.isArray(o.data) ? o.data : [];
    return {
      data: data as StaffSessionListResponse['data'],
      page: typeof o.page === 'number' ? o.page : Number(o.page) || 1,
      total: typeof o.total === 'number' ? o.total : Number(o.total) || data.length,
    };
  }
  if (Array.isArray(raw)) {
    return { data: raw as StaffSessionListResponse['data'], page: 1, total: raw.length };
  }
  return { data: [], page: 1, total: 0 };
}

export const hospitalAdminApi = createApi({
  reducerPath: 'hospitalAdminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'HospitalAdminStaff',
    'ReferralStatusHistory',
    'HospitalAdminAudit',
    'HospitalAdminDepartments',
    'HospitalAdminProfile',
    'HospitalAdminReferrals',
    'HospitalAdminStaffSessions',
  ],
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
    reassignStaffDepartment: builder.mutation<
      HospitalAdminStaffDetail,
      { id: string } & ReassignStaffDepartmentPayload
    >({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_DEPARTMENT(id),
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail }) =>
        unwrapStaffDetail(raw),
      invalidatesTags: (result, error, { id }) => [
        { type: 'HospitalAdminStaff', id },
        'HospitalAdminStaff',
      ],
    }),
    forceLogoutStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_FORCE_LOGOUT(id),
        method: 'POST',
      }),
      invalidatesTags: ['HospitalAdminStaffSessions'],
    }),
    getStaffSessions: builder.query<StaffSessionListResponse, GetHospitalAdminReferralsParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        const page = params?.page ?? 1;
        const pageSize = params?.page_size ?? params?.limit ?? 20;
        searchParams.set('page', String(page));
        searchParams.set('page_size', String(pageSize));
        return `${HOSPITAL_ADMIN_ROUTES.STAFF_SESSIONS}?${searchParams.toString()}`;
      },
      transformResponse: (raw: unknown) => unwrapStaffSessions(raw),
      providesTags: ['HospitalAdminStaffSessions'],
    }),
    getHospitalDepartments: builder.query<HospitalAdminDepartment[], void>({
      query: () => HOSPITAL_ADMIN_ROUTES.DEPARTMENTS,
      transformResponse: (raw: unknown) => unwrapHospitalDepartments(raw),
      providesTags: ['HospitalAdminDepartments'],
    }),
    addHospitalDepartment: builder.mutation<HospitalAdminDepartment, AddHospitalDepartmentPayload>({
      query: (body) => ({
        url: HOSPITAL_ADMIN_ROUTES.DEPARTMENTS,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => unwrapHospitalDepartmentObject(raw),
      invalidatesTags: ['HospitalAdminDepartments'],
    }),
    updateDepartmentActivation: builder.mutation<
      HospitalAdminDepartment,
      { deptId: string } & UpdateDepartmentActivationPayload
    >({
      query: ({ deptId, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.DEPARTMENT_ACTIVATION(deptId),
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: unknown) => unwrapHospitalDepartmentObject(raw),
      invalidatesTags: ['HospitalAdminDepartments'],
    }),
    assignDepartmentHead: builder.mutation<
      HospitalAdminDepartment,
      { deptId: string } & AssignDepartmentHeadPayload
    >({
      query: ({ deptId, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.DEPARTMENT_HEAD(deptId),
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: unknown) => unwrapHospitalDepartmentObject(raw),
      invalidatesTags: ['HospitalAdminDepartments'],
    }),
    getHospitalProfile: builder.query<HospitalAdminProfile, void>({
      query: () => HOSPITAL_ADMIN_ROUTES.HOSPITAL_PROFILE,
      transformResponse: (raw: unknown) => unwrapObject<HospitalAdminProfile>(raw),
      providesTags: ['HospitalAdminProfile'],
    }),
    updateHospitalProfile: builder.mutation<
      HospitalAdminProfile,
      UpdateHospitalAdminProfilePayload
    >({
      query: (body) => ({
        url: HOSPITAL_ADMIN_ROUTES.HOSPITAL_PROFILE,
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: unknown) => unwrapObject<HospitalAdminProfile>(raw),
      invalidatesTags: ['HospitalAdminProfile'],
    }),
    getReferralsLog: builder.query<
      HospitalReferralLogResponse,
      GetHospitalAdminReferralsParams | void
    >({
      query: (params) => buildReferralsQuery(HOSPITAL_ADMIN_ROUTES.REFERRALS_LOG, params ?? undefined),
      transformResponse: (raw: unknown) => unwrapReferralsLog(raw),
      providesTags: ['HospitalAdminReferrals'],
    }),
    getInboundReferrals: builder.query<
      ReferralListPaginatedResponse,
      GetHospitalAdminReferralsParams | void
    >({
      query: (params) =>
        buildReferralsQuery(HOSPITAL_ADMIN_ROUTES.REFERRALS_INBOUND, params ?? undefined),
      transformResponse: (raw: unknown) => unwrapReferralsList(raw),
      providesTags: ['HospitalAdminReferrals'],
    }),
    getOutboundReferrals: builder.query<
      ReferralListPaginatedResponse,
      GetHospitalAdminReferralsParams | void
    >({
      query: (params) =>
        buildReferralsQuery(HOSPITAL_ADMIN_ROUTES.REFERRALS_OUTBOUND, params ?? undefined),
      transformResponse: (raw: unknown) => unwrapReferralsList(raw),
      providesTags: ['HospitalAdminReferrals'],
    }),
    getPendingApprovalReferrals: builder.query<
      ReferralListPaginatedResponse,
      GetHospitalAdminReferralsParams | void
    >({
      query: (params) =>
        buildReferralsQuery(
          HOSPITAL_ADMIN_ROUTES.REFERRALS_PENDING_APPROVALS,
          params ?? undefined,
        ),
      transformResponse: (raw: unknown) => unwrapReferralsList(raw),
      providesTags: ['HospitalAdminReferrals'],
    }),
    getRejectedRedirectedReferrals: builder.query<
      ReferralListPaginatedResponse,
      GetHospitalAdminReferralsParams | void
    >({
      query: (params) =>
        buildReferralsQuery(
          HOSPITAL_ADMIN_ROUTES.REFERRALS_REJECTED_REDIRECTED,
          params ?? undefined,
        ),
      transformResponse: (raw: unknown) => unwrapReferralsList(raw),
      providesTags: ['HospitalAdminReferrals'],
    }),
    getReferralStatsByStatus: builder.query<ReferralStatsByStatusRow[], void>({
      query: () => HOSPITAL_ADMIN_ROUTES.REFERRALS_STATS_BY_STATUS,
      transformResponse: (raw: unknown) => unwrapReferralStats(raw),
      providesTags: ['HospitalAdminReferrals'],
    }),
    getReferralById: builder.query<Referral, string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.REFERRAL_BY_ID(id),
      transformResponse: (raw: unknown) => unwrapObject<Referral>(raw),
      providesTags: (result, error, id) => [{ type: 'HospitalAdminReferrals', id }],
    }),
    getReferralStatusHistory: builder.query<ReferralStatusHistory[], string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.STATUS_HISTORY(id),
      transformResponse: (raw: unknown) => unwrapReferralStatusHistory(raw),
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
  useReassignStaffDepartmentMutation,
  useForceLogoutStaffMutation,
  useGetStaffSessionsQuery,
  useGetHospitalDepartmentsQuery,
  useAddHospitalDepartmentMutation,
  useUpdateDepartmentActivationMutation,
  useAssignDepartmentHeadMutation,
  useGetHospitalProfileQuery,
  useUpdateHospitalProfileMutation,
  useGetReferralsLogQuery,
  useGetInboundReferralsQuery,
  useGetOutboundReferralsQuery,
  useGetPendingApprovalReferralsQuery,
  useGetRejectedRedirectedReferralsQuery,
  useGetReferralStatsByStatusQuery,
  useGetReferralByIdQuery,
  useGetReferralStatusHistoryQuery,
  useGetAuditLogsQuery,
  useGetAcceptanceRejectionRateQuery,
  useGetAverageWaitTimeQuery,
  useGetBusiestDepartmentsQuery,
  useGetMissedAppointmentRateQuery,
  useGetMonthlyReferralsQuery,
  useGetTopReferringHospitalsQuery,
} = hospitalAdminApi;
