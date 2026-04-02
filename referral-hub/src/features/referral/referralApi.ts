import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { REFERRAL_ROUTES } from '@/config/api'
import { CreateReferralRequest } from '@/types/referral'

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
                const { doctor_id, hospital_id, ...body } = requestBody;
                return {
                    url: REFERRAL_ROUTES.CREATE,
                    method: 'POST',
                    body: body,
                    headers: {
                        'doctor-id': doctor_id,
                        'hospital-id': hospital_id,
                    },
                };
            },
            invalidatesTags: ['Referral'],
        }),
    }),
})

export const { useCreateReferralMutation } = referralApi
