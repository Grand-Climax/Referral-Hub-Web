import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { REFERRAL_ROUTES } from '@/config/api'
import { Referral } from '@/types/referral'

export const liaisonApi = createApi({
  reducerPath: 'liaisonApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Referral'],
  endpoints: (builder) => ({
    getReferrals: builder.query<{ data: Referral[] }, void>({
      query: () => REFERRAL_ROUTES.LIST,
      providesTags: ['Referral'],
    }),
    getReferralById: builder.query<{ data: Referral }, string>({
      query: (id) => `${REFERRAL_ROUTES.LIST}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Referral', id }],
    }),
  }),
})

export const { useGetReferralsQuery, useGetReferralByIdQuery } = liaisonApi
