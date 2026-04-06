import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { LIAISON_ROUTES } from '@/config/api'
import { Referral } from '@/types/referral'

import { ReferralListPaginatedResponse } from '@/types/referral-list'

export const liaisonApi = createApi({
  reducerPath: 'liaisonApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Referral'],
  endpoints: (builder) => ({
    getReferrals: builder.query<ReferralListPaginatedResponse, { page?: number; page_size?: number } | void>({
      query: (params) => {
        const pageNum = params?.page ?? 0;
        const pageSize = params?.page_size ?? 10;
        return `${LIAISON_ROUTES.LIST}?page=${pageNum}&page_size=${pageSize}`;
      },
      providesTags: ['Referral'],
    }),
    getReferralById: builder.query<Referral, string>({
      query: (id) => `${LIAISON_ROUTES.GET_BY_ID(id)}`,
      providesTags: (result, error, id) => [{ type: 'Referral', id }],
    }),
  }),
})

export const { useGetReferralsQuery, useGetReferralByIdQuery } = liaisonApi
