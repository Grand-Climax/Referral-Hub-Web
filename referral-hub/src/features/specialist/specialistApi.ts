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

export const specialistApi = createApi({
  reducerPath: 'specialistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SpecialistReferral'],
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
      providesTags: (result, error, id) => [{ type: 'SpecialistReferral', id }],
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
} = specialistApi