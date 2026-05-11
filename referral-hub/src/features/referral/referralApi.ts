import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { REFERRAL_ROUTES } from '@/config/api'
import { CreateReferralRequest, Referral } from '@/types/referral'

import { ReferralListPaginatedResponse } from '@/types/referral-list'

interface ReferralResponse {
    id?: string;
    status?: string;
    success?: boolean;
    message?: string;
    referral?: { id: string };
}

type CreateReferralMutationRequest = CreateReferralRequest & {
    attachments?: File[];
    attachment_category?: string;
};

type ResubmitReferralRequest = Partial<CreateReferralRequest> & {
    attachments?: File[];
    attachment_category?: string;
};

function buildReferralFormData(
    referralPayload: object,
    attachments?: File[],
    attachmentCategory?: string
) {
    const body = new FormData();

    body.append('referral', JSON.stringify(referralPayload));

    attachments?.forEach((file) => {
        body.append('attachments', file);
    });

    if (attachmentCategory) {
        body.append('attachment_category', attachmentCategory);
    }

    return body;
}

export const referralApi = createApi({
    reducerPath: 'referralApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Referral'],
    endpoints: (builder) => ({
        createReferral: builder.mutation<ReferralResponse, CreateReferralMutationRequest>({
            query: ({ attachments, attachment_category, ...requestBody }) => {
                return {
                    url: REFERRAL_ROUTES.CREATE,
                    method: 'POST',
                    body: buildReferralFormData(requestBody, attachments, attachment_category),
                    formData: true,
                };
            },
            invalidatesTags: ['Referral'],
        }),
        getReferrals: builder.query<ReferralListPaginatedResponse, {
            page?: number;
            limit?: number;
            status?: string;
            region?: string;
            patient_name?: string;
            sort?: 'asc' | 'desc';
        } | void>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params?.page != null) searchParams.set('page', String(params.page));
                if (params?.limit != null) searchParams.set('limit', String(params.limit));
                if (params?.status) searchParams.set('status', params.status);
                if (params?.region) searchParams.set('region', params.region);
                if (params?.patient_name) searchParams.set('patient_name', params.patient_name);
                if (params?.sort) searchParams.set('sort', params.sort);
                const qs = searchParams.toString();
                return `${REFERRAL_ROUTES.LIST}${qs ? `?${qs}` : ''}`;
            },
            providesTags: ['Referral'],
        }),
        getReferralById: builder.query<Referral, string>({
            query: (id) => REFERRAL_ROUTES.GET_BY_ID(id),
            providesTags: (result, error, id) => [{ type: 'Referral', id }],
        }),
        resubmitReferral: builder.mutation<Referral, { id: string; body: ResubmitReferralRequest }>({
            query: ({ id, body }) => {
                const { attachments, attachment_category, ...requestBody } = body;

                if (attachments?.length || attachment_category) {
                    return {
                        url: REFERRAL_ROUTES.RESUBMIT(id),
                        method: 'PUT',
                        body: buildReferralFormData(requestBody, attachments, attachment_category),
                        formData: true,
                    };
                }

                return {
                    url: REFERRAL_ROUTES.RESUBMIT(id),
                    method: 'PUT',
                    body: requestBody,
                };
            },
            invalidatesTags: (result, error, { id }) => [{ type: 'Referral', id }, 'Referral'],
        }),
    }),
})

export const { 
    useCreateReferralMutation, 
    useGetReferralsQuery, 
    useGetReferralByIdQuery,
    useResubmitReferralMutation
} = referralApi
