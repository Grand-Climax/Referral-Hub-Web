import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { REFERRAL_ROUTES } from '@/config/api'
import { CreateReferralRequest, Referral } from '@/types/referral'

import { ReferralListPaginatedResponse } from '@/types/referral-list'

interface ReferralResponse {
    id: string;
    status: string;
    message?: string;
}

export const referralApi = createApi({
    reducerPath: 'referralApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Referral'],
    endpoints: (builder) => ({
        createReferral: builder.mutation<ReferralResponse, CreateReferralRequest>({
            query: (requestBody) => {
                return {
                    url: REFERRAL_ROUTES.CREATE,
                    method: 'POST',
                    body: requestBody,
                };
            },
            invalidatesTags: ['Referral'],
        }),
        getReferrals: builder.query<ReferralListPaginatedResponse, { page?: number; page_size?: number } | void>({
            query: (params) => {
                const pageNum = params?.page ?? 0;
                const pageSize = params?.page_size ?? 10;
                return `${REFERRAL_ROUTES.LIST}?page=${pageNum}&page_size=${pageSize}`;
            },
            providesTags: ['Referral'],
        }),
        getReferralById: builder.query<Referral, string>({
            query: (id) => `${REFERRAL_ROUTES.GET_BY_ID(id)}`,
            providesTags: (result, error, id) => [{ type: 'Referral', id }],
        }),
    }),
})

export const { useCreateReferralMutation, useGetReferralsQuery, useGetReferralByIdQuery } = referralApi