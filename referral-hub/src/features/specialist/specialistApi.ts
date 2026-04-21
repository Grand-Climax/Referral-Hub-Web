import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { SPECIALIST_ROUTES } from '@/config/api'
import { 
  SpecialistReferralListResponse, 
  SpecialistReferralDetailResponse 
} from '@/types/specialist'

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

    releaseReferral: builder.mutation<void, string>({
      query: (id) => ({
        url: `${SPECIALIST_ROUTES.RELEASE(id)}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'SpecialistReferral', id }, 'SpecialistReferral'],
    }),
  }),
})

export const { 
  useGetReferralsQuery, 
  useGetReferralByIdQuery,
  useAcceptReferralMutation,
  useRejectReferralMutation,
  useMarkReferralReadMutation,
  useReleaseReferralMutation
} = specialistApi

