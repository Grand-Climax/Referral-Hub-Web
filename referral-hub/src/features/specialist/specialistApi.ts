import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { SPECIALIST_ROUTES } from '@/config/api'
import {
  SpecialistReferralListResponse,
  SpecialistReferralDetailResponse,
  RedirectHospitalOption,
  RedirectOptionsResponse,
  RedirectReferralRequest,
  ReleaseReferralRequest,
  MlPredictionDetail,
  MlSeverityOverrideRequest,
  MlSeverityOverrideResponse,
  SpecialistReferralDetail,
} from '@/types/specialist'
import type { SpecialistReferralListItem } from '@/types/specialist'
import type {
  TriageListItem,
  TriageListEnvelope,
  TriageQueueFilters,
  TriageDetailSpecialist,
  ScheduleOption,
  ScheduleRequest,
  EmergencyScheduleRequest,
  ScheduleSuccessResponse,
  ReturnToTriageRequest,
} from '@/types/specialist-triage'

function normalizeSpecialistListResponse(
  raw: SpecialistReferralListResponse | { data?: SpecialistReferralListItem[]; total?: number; page?: number; limit?: number },
): SpecialistReferralListResponse {
  const data = Array.isArray(raw.data) ? raw.data : []
  return {
    data,
    success: 'success' in raw ? Boolean(raw.success) : true,
    message: 'message' in raw && typeof raw.message === 'string' ? raw.message : '',
    total: Number(raw.total ?? data.length),
    page: Number(raw.page ?? 1),
    limit: Number(raw.limit ?? data.length),
  }
}

function unwrapRedirectOptions(raw: RedirectOptionsResponse | RedirectHospitalOption[]): RedirectHospitalOption[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.hospitals)) return raw.hospitals;
  return [];
}

function unwrapSpecialistReferralDetail(
  raw: SpecialistReferralDetailResponse | { data?: SpecialistReferralDetail },
): SpecialistReferralDetailResponse {
  const source =
    raw && typeof raw === 'object' && 'data' in raw && raw.data
      ? (raw.data as unknown as Record<string, unknown>)
      : (raw as unknown as Record<string, unknown>);

  const pickString = (...keys: string[]) => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
    return undefined;
  };

  const pickNumber = (...keys: string[]) => {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'number' && !Number.isNaN(value)) return value;
    }
    return undefined;
  };

  const detail = source as unknown as SpecialistReferralDetail;

  return {
    ...detail,
    id: pickString('id', 'ID') ?? detail.id,
    status: pickString('status', 'Status') ?? detail.status,
    specialist_id:
      pickString('specialist_id', 'specialistId', 'SpecialistID') ??
      detail.specialist_id ??
      null,
    ml_status:
      pickString('ml_status', 'mlStatus', 'MLStatus') ?? detail.ml_status ?? 'PENDING',
    ml_severity_score:
      pickNumber('ml_severity_score', 'mlSeverityScore', 'MLSeverityScore') ??
      detail.ml_severity_score ??
      null,
    triage_status:
      pickString('triage_status', 'triageStatus', 'TriageStatus') ??
      detail.triage_status ??
      null,
    ml_successful_rerun_count:
      pickNumber(
        'ml_successful_rerun_count',
        'mlSuccessfulRerunCount',
        'MLSuccessfulRerunCount',
      ) ?? detail.ml_successful_rerun_count ?? 0,
    ml_retry_count:
      pickNumber('ml_retry_count', 'mlRetryCount', 'MLRetryCount') ??
      detail.ml_retry_count ??
      0,
    ml_run_started_at:
      pickString('ml_run_started_at', 'mlRunStartedAt', 'MLRunStartedAt') ??
      detail.ml_run_started_at ??
      null,
    ml_last_failed_at:
      pickString('ml_last_failed_at', 'mlLastFailedAt', 'MLLastFailedAt') ??
      detail.ml_last_failed_at ??
      null,
    ml_last_error:
      pickString('ml_last_error', 'mlLastError', 'MLLastError') ??
      detail.ml_last_error ??
      null,
    success:
      raw && typeof raw === 'object' && 'success' in raw
        ? Boolean(raw.success)
        : true,
    message:
      raw && typeof raw === 'object' && 'message' in raw && typeof raw.message === 'string'
        ? raw.message
        : '',
  };
}

function unwrapMlPrediction(raw: unknown): MlPredictionDetail {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
    return raw.data as MlPredictionDetail;
  }
  return raw as MlPredictionDetail;
}

export const specialistApi = createApi({
  reducerPath: 'specialistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'SpecialistReferral',
    'MlPrediction',
    'SpecialistTriageQueue',
    'SpecialistTriageDetail',
    'ScheduleOptions',
  ],
  endpoints: (builder) => ({
    getReferrals: builder.query<SpecialistReferralListResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const pageNum = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return `${SPECIALIST_ROUTES.LIST}?page=${pageNum}&limit=${limit}`;
      },
      transformResponse: (raw: SpecialistReferralListResponse) =>
        normalizeSpecialistListResponse(raw),
      providesTags: ['SpecialistReferral'],
    }),
    getArchiveReferrals: builder.query<
      SpecialistReferralListResponse,
      {
        page?: number;
        limit?: number;
        listType?: 'all' | 'approved' | 'rejected' | 'completed';
      }
    >({
      query: (params) => {
        const pageNum = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        const url =
          params?.listType === 'approved'
            ? SPECIALIST_ROUTES.APPROVED
            : params?.listType === 'rejected'
              ? SPECIALIST_ROUTES.REJECTED
              : SPECIALIST_ROUTES.LIST;

        return {
          url,
          params: {
            page: pageNum,
            limit,
            ...(params?.listType === 'completed' ? { status: 'COMPLETED' } : {}),
          },
        };
      },
      transformResponse: (raw: SpecialistReferralListResponse) =>
        normalizeSpecialistListResponse(raw),
      providesTags: ['SpecialistReferral'],
    }),
    getReferralById: builder.query<SpecialistReferralDetailResponse, string>({
      query: (id) => `${SPECIALIST_ROUTES.GET_BY_ID(id)}`,
      transformResponse: (raw: SpecialistReferralDetailResponse | { data?: SpecialistReferralDetail }) =>
        unwrapSpecialistReferralDetail(raw),
      providesTags: (result, error, id) => [{ type: 'SpecialistReferral', id }],
    }),
    getMlPrediction: builder.query<MlPredictionDetail | null, string>({
      async queryFn(referralId, _api, _extra, baseQuery) {
        const result = await baseQuery({
          url: SPECIALIST_ROUTES.ML_PREDICTION(referralId),
          method: 'GET',
        });

        if (result.error) {
          if (result.error.status === 404) {
            return { data: null };
          }
          return { error: result.error };
        }

        return { data: unwrapMlPrediction(result.data) };
      },
      providesTags: (_result, _error, id) => [{ type: 'MlPrediction', id }],
    }),
    overrideMlSeverity: builder.mutation<
      MlSeverityOverrideResponse,
      { referralId: string; body: MlSeverityOverrideRequest }
    >({
      query: ({ referralId, body }) => ({
        url: SPECIALIST_ROUTES.ML_SEVERITY_OVERRIDE(referralId),
        method: 'POST',
        body,
      }),
      transformResponse: (raw: MlSeverityOverrideResponse | undefined) => ({
        success: Boolean(raw?.success ?? true),
        message: raw?.message ?? 'Severity score manually overridden successfully',
      }),
      invalidatesTags: (_result, _error, { referralId }) => [
        { type: 'SpecialistReferral', id: referralId },
        { type: 'MlPrediction', id: referralId },
      ],
    }),
    rerunMlPrediction: builder.mutation<{ success: boolean; message: string }, string>({
      query: (referralId) => ({
        url: SPECIALIST_ROUTES.RERUN_ML(referralId),
        method: 'POST',
      }),
      transformResponse: (
        raw: { success?: boolean; message?: string } | undefined,
      ) => ({
        success: Boolean(raw?.success ?? true),
        message: raw?.message ?? 'ML prediction rerun successfully',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SpecialistReferral', id },
        { type: 'MlPrediction', id },
      ],
    }),
    acceptReferral: builder.mutation<void, string>({
      query: (id) => ({
        url: `${SPECIALIST_ROUTES.ACCEPT(id)}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'SpecialistReferral', id }, 'SpecialistReferral'],
    }),
    rejectReferral: builder.mutation<void, { id: string; rejection_reason: string }>({
      query: ({ id, rejection_reason }) => ({
        url: `${SPECIALIST_ROUTES.REJECT(id)}`,
        method: 'POST',
        body: { rejection_reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SpecialistReferral', id }, 'SpecialistReferral'],
    }),
    markReferralRead: builder.mutation<void, string>({
      query: (id) => ({
        url: `${SPECIALIST_ROUTES.READ(id)}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'SpecialistReferral', id }, 'SpecialistReferral'],
    }),

    releaseReferral: builder.mutation<void, ReleaseReferralRequest>({
      query: ({ id, reason }) => ({
        url: `${SPECIALIST_ROUTES.RELEASE(id)}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SpecialistReferral', id }, 'SpecialistReferral'],
    }),
    getRedirectOptions: builder.query<RedirectHospitalOption[], string>({
      query: (id) => `${SPECIALIST_ROUTES.REDIRECT_OPTIONS(id)}`,
      transformResponse: (raw: RedirectOptionsResponse | RedirectHospitalOption[]) => unwrapRedirectOptions(raw),
      providesTags: (result, error, id) => [{ type: 'SpecialistReferral', id }],
    }),
    redirectReferral: builder.mutation<void, RedirectReferralRequest>({
      query: ({ id, target_hospital_id, department_id, reason }) => ({
        url: `${SPECIALIST_ROUTES.REDIRECT(id)}`,
        method: 'POST',
        body: { target_hospital_id, department_id, reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SpecialistReferral', id }, 'SpecialistReferral'],
    }),
    /**
     * PUT /api/v1/specialist/referrals/{id}/department
     *
     * Path param `id` is the referral id; body is
     * `{ "department_id": "<new department id>" }`.
     */
    changeReferralDepartment: builder.mutation<
      void,
      { referralId: string; departmentId: string }
    >({
      query: ({ referralId, departmentId }) => ({
        url: SPECIALIST_ROUTES.CHANGE_DEPARTMENT(referralId),
        method: 'PUT',
        body: { department_id: departmentId },
      }),
      invalidatesTags: (_result, _error, { referralId }) => [
        { type: 'SpecialistReferral', id: referralId },
        'SpecialistReferral',
      ],
    }),

    // ─── Specialist Triage Queue (post-acceptance scheduling workspace) ─────────

    /**
     * Specialist triage list.
     *
     * Same filter matrix as the dept-head endpoint (csv list params, sort
     * enums, terminal-status toggle). We build the URL by hand because
     * RTK-Query's `params` object repeats keys for arrays instead of
     * comma-joining — the server only accepts the csv form.
     */
    getSpecialistTriageQueue: builder.query<
      TriageListEnvelope,
      TriageQueueFilters | void
    >({
      query: (filters) => {
        const f = filters ?? {}
        const sp = new URLSearchParams()
        sp.set('page', String(f.page ?? 1))
        sp.set('limit', String(f.limit ?? 20))
        if (f.department_id) sp.set('department_id', f.department_id)
        if (f.arrival_status?.length)
          sp.set('arrival_status', f.arrival_status.join(','))
        if (f.referral_status?.length)
          sp.set('referral_status', f.referral_status.join(','))
        if (typeof f.has_doctor_assigned === 'boolean')
          sp.set('has_doctor_assigned', String(f.has_doctor_assigned))
        if (f.patient_id) sp.set('patient_id', f.patient_id)
        if (f.national_id) sp.set('national_id', f.national_id)
        if (f.sort_by) sp.set('sort_by', f.sort_by)
        if (f.sort_order) sp.set('sort_order', f.sort_order)
        if (f.include_terminal) sp.set('include_terminal', 'true')
        return `${SPECIALIST_ROUTES.TRIAGE_QUEUE}?${sp.toString()}`
      },
      transformResponse: (raw: unknown): TriageListEnvelope => {
        if (Array.isArray(raw)) {
          return {
            success: true,
            data: raw as TriageListItem[],
            total: raw.length,
            page: 1,
            limit: raw.length,
            has_more: false,
          }
        }
        const r = (raw ?? {}) as Partial<TriageListEnvelope> & {
          data?: TriageListItem[]
        }
        return {
          success: r.success ?? true,
          data: r.data ?? [],
          total: r.total ?? r.data?.length ?? 0,
          page: r.page ?? 1,
          limit: r.limit ?? 20,
          has_more: r.has_more ?? false,
        }
      },
      providesTags: ['SpecialistTriageQueue'],
    }),

    /**
     * Specialist triage detail. `referralId` is the `referral_id` from a list
     * row — never the `queue_id`. Returns `null` on 404 so the UI can render
     * a friendly empty state instead of a generic error banner.
     */
    getSpecialistTriageDetail: builder.query<
      TriageDetailSpecialist | null,
      string
    >({
      query: (referralId) => SPECIALIST_ROUTES.TRIAGE_DETAIL(referralId),
      transformResponse: (raw: unknown): TriageDetailSpecialist | null => {
        if (!raw) return null
        const r = raw as Record<string, unknown>
        if (r.data && typeof r.data === 'object') {
          return r.data as TriageDetailSpecialist
        }
        return raw as TriageDetailSpecialist
      },
      providesTags: (_r, _e, referralId) => [
        { type: 'SpecialistTriageDetail', id: referralId },
      ],
    }),

    /**
     * Capacity preview for the next N days. Powers the date picker / readout
     * in the scheduling modals. Server clamps `days` to 30.
     */
    getScheduleOptions: builder.query<
      ScheduleOption[],
      { referralId: string; days?: number }
    >({
      query: ({ referralId, days = 14 }) => ({
        url: SPECIALIST_ROUTES.SCHEDULE_OPTIONS(referralId),
        params: { days },
      }),
      transformResponse: (raw: unknown): ScheduleOption[] => {
        if (Array.isArray(raw)) return raw as ScheduleOption[]
        const r = (raw ?? {}) as Record<string, unknown>
        if (Array.isArray(r.data)) return r.data as ScheduleOption[]
        if (Array.isArray(r.options)) return r.options as ScheduleOption[]
        return []
      },
      providesTags: (_r, _e, { referralId }) => [
        { type: 'ScheduleOptions', id: referralId },
      ],
    }),

    /**
     * Routine schedule. `appointment_date` is RFC3339 here (NOT date-only) —
     * see §2.1 of FRONTEND_SCHEDULE_OVERRIDE.md.
     */
    scheduleAppointment: builder.mutation<
      ScheduleSuccessResponse,
      { referralId: string; body: ScheduleRequest }
    >({
      query: ({ referralId, body }) => ({
        url: SPECIALIST_ROUTES.SCHEDULE(referralId),
        method: 'POST',
        body,
      }),
      // Invalidate the detail, the queue (any filter), and the capacity
      // preview so all three views resync on success.
      invalidatesTags: (_r, _e, { referralId }) => [
        { type: 'SpecialistTriageDetail', id: referralId },
        'SpecialistTriageQueue',
        { type: 'ScheduleOptions', id: referralId },
        { type: 'SpecialistReferral', id: referralId },
      ],
    }),

    /**
     * Emergency override. `appointment_date` is **YYYY-MM-DD** here (NOT
     * RFC3339) — the two scheduling endpoints intentionally use different
     * formats; see §2.2 of the guide.
     */
    emergencySchedule: builder.mutation<
      ScheduleSuccessResponse,
      { referralId: string; body: EmergencyScheduleRequest }
    >({
      query: ({ referralId, body }) => ({
        url: SPECIALIST_ROUTES.EMERGENCY_SCHEDULE(referralId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { referralId }) => [
        { type: 'SpecialistTriageDetail', id: referralId },
        'SpecialistTriageQueue',
        { type: 'ScheduleOptions', id: referralId },
        { type: 'SpecialistReferral', id: referralId },
      ],
    }),

    /**
     * Return-to-triage. Only allowed for MISSED rows; flips the row back
     * into the active queue with a fresh expectation.
     */
    returnToTriage: builder.mutation<
      { success: boolean; message: string },
      { referralId: string; body: ReturnToTriageRequest }
    >({
      query: ({ referralId, body }) => ({
        url: SPECIALIST_ROUTES.RETURN_TO_TRIAGE(referralId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { referralId }) => [
        { type: 'SpecialistTriageDetail', id: referralId },
        'SpecialistTriageQueue',
      ],
    }),
  }),
})

export const {
  useGetReferralsQuery,
  useGetArchiveReferralsQuery,
  useGetReferralByIdQuery,
  useAcceptReferralMutation,
  useRejectReferralMutation,
  useMarkReferralReadMutation,
  useReleaseReferralMutation,
  useGetRedirectOptionsQuery,
  useRedirectReferralMutation,
  useChangeReferralDepartmentMutation,
  useGetMlPredictionQuery,
  useRerunMlPredictionMutation,
  useOverrideMlSeverityMutation,
  // Triage queue
  useGetSpecialistTriageQueueQuery,
  useGetSpecialistTriageDetailQuery,
  useGetScheduleOptionsQuery,
  useScheduleAppointmentMutation,
  useEmergencyScheduleMutation,
  useReturnToTriageMutation,
} = specialistApi