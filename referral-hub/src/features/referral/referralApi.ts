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
    upload_config?: UploadSignature;
}

export interface UploadSignature {
    signature: string;
    timestamp: number;
    api_key: string;
    cloud_name: string;
    folder: string;
}

export interface UploadAttachmentRequest {
    file: File;
    config: UploadSignature;
    referralId: string;
}

export interface UploadAttachmentResponse {
    public_id: string;
    secure_url: string;
    [key: string]: any;
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
        uploadAttachment: builder.mutation<UploadAttachmentResponse, UploadAttachmentRequest>({
            queryFn: async (arg) => {
                const { file, config, referralId } = arg;
                const formData = new FormData();
                
                // Cloudinary signed uploads require: file, api_key, timestamp, signature
                // Handle possible naming variations from backend (e.g. unix_timestamp)
                const timestamp = config.timestamp || (config as any).unix_timestamp;
                const apiKey = config.api_key;
                const signature = config.signature;
                const folder = config.folder;

                if (!timestamp || !apiKey || !signature) {
                    const missing = [];
                    if (!timestamp) missing.push('timestamp');
                    if (!apiKey) missing.push('api_key');
                    if (!signature) missing.push('signature');
                    return { 
                        error: { 
                            status: 'CUSTOM_ERROR',
                            error: `Incomplete upload configuration from server. Missing: ${missing.join(', ')}` 
                        } 
                    };
                }
                
                formData.append('file', file);
                formData.append('api_key', apiKey || '');
                formData.append('timestamp', String(timestamp));
                formData.append('signature', signature || '');
                formData.append('folder', folder || ''); 
                
                const baseUrl = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL || 'https://api.cloudinary.com/v1_1';
                // Remove trailing slash if present to avoid double slashes
                const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                
                try {
                    const response = await fetch(`${normalizedBaseUrl}/${config.cloud_name}/auto/upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        return { error: { status: response.status, data: error } as any };
                    }

                    const data = await response.json();
                    return { data };
                } catch (error: any) {
                    return { error: { status: 'FETCH_ERROR', error: error.message } };
                }
            },
        }),
        resubmitReferral: builder.mutation<Referral, { id: string; body: Partial<CreateReferralRequest> }>({
            query: ({ id, body }) => ({
                url: REFERRAL_ROUTES.RESUBMIT(id),
                method: 'PUT',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Referral', id }, 'Referral'],
        }),
    }),
})

export const { 
    useCreateReferralMutation, 
    useGetReferralsQuery, 
    useGetReferralByIdQuery,
    useUploadAttachmentMutation,
    useResubmitReferralMutation
} = referralApi