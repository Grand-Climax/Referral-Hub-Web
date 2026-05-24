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
  tagTypes: ['SpecialistReferral', 'MlPrediction'],
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
  useGetMlPredictionQuery,
  useRerunMlPredictionMutation,
  useOverrideMlSeverityMutation,
} = specialistApi