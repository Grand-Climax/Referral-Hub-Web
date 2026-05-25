import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import {
  REFERRAL_ROUTES,
  SHARED_REFERRAL_ROUTES,
} from '@/config/api';
import type { AssignedReferralRow } from '@/types/clinical';
import type { MarkDeceasedPayload } from '@/types/clinical';
export interface AssignedReferralsPaginated {
  data: AssignedReferralRow[];
  page: number;
  limit: number;
  total: number;
}

interface ApiMessage {
  success?: boolean;
  message?: string;
}

function unwrapAssignedList(raw: unknown): AssignedReferralRow[] {
  if (Array.isArray(raw)) return raw as AssignedReferralRow[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as AssignedReferralRow[];
    if (Array.isArray(r.referrals)) return r.referrals as AssignedReferralRow[];
    const nested = r.data as Record<string, unknown> | undefined;
    if (nested && Array.isArray(nested.data)) {
      return nested.data as AssignedReferralRow[];
    }
  }
  return [];
}

export interface AssignedReferralsParams {
  page?: number;
  limit?: number;
  access_type?: 'treating' | 'consulting' | 'TREATING_DOCTOR' | 'CONSULTED_DOCTOR';
  include_revoked?: boolean;
  status?: string;
  patient_id?: string;
  national_id?: string;
}

export const doctorReferralApi = createApi({
  reducerPath: 'doctorReferralApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AssignedReferral', 'Referral'],
  endpoints: (builder) => ({
    getAssignedReferrals: builder.query<
      AssignedReferralsPaginated,
      AssignedReferralsParams | void
    >({
      query: (params) => {
        const sp = new URLSearchParams();
        sp.set('page', String(params?.page ?? 1));
        sp.set('limit', String(params?.limit ?? 20));
        if (params?.access_type) sp.set('access_type', params.access_type);
        if (params?.include_revoked) sp.set('include_revoked', 'true');
        if (params?.status) sp.set('status', params.status);
        if (params?.patient_id) sp.set('patient_id', params.patient_id);
        if (params?.national_id) sp.set('national_id', params.national_id);
        const qs = sp.toString();
        return `${REFERRAL_ROUTES.ASSIGNED}${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (raw: unknown) => {
        const list = unwrapAssignedList(raw);
        const root = raw as Record<string, unknown>;
        const nested =
          root?.data && typeof root.data === 'object'
            ? (root.data as Record<string, unknown>)
            : root;
        return {
          data: list,
          total: Number(nested?.total ?? list.length),
          page: Number(nested?.page ?? 1),
          limit: Number(nested?.limit ?? 20),
        };
      },
      providesTags: ['AssignedReferral'],
    }),

    grantConsultAccess: builder.mutation<
      ApiMessage,
      { referralId: string; doctor_id: string }
    >({
      query: ({ referralId, doctor_id }) => ({
        url: REFERRAL_ROUTES.CONSULT(referralId),
        method: 'POST',
        body: { doctor_id },
      }),
      invalidatesTags: (r, e, { referralId }) => [
        { type: 'Referral', id: referralId },
        'AssignedReferral',
      ],
    }),

    revokeConsultAccess: builder.mutation<
      ApiMessage,
      { referralId: string; doctor_id: string; reason: string }
    >({
      query: ({ referralId, doctor_id, reason }) => ({
        url: REFERRAL_ROUTES.CONSULT_REVOKE(referralId),
        method: 'POST',
        body: { doctor_id, reason },
      }),
      invalidatesTags: (r, e, { referralId }) => [
        { type: 'Referral', id: referralId },
        'AssignedReferral',
      ],
    }),

    cancelReferral: builder.mutation<ApiMessage, string>({
      query: (id) => ({
        url: REFERRAL_ROUTES.CANCEL(id),
        method: 'POST',
      }),
      invalidatesTags: (r, e, id) => [{ type: 'Referral', id }, 'Referral'],
    }),

    rejectAfterSend: builder.mutation<ApiMessage, string>({
      query: (id) => ({
        url: REFERRAL_ROUTES.REJECT_AFTER_SEND(id),
        method: 'POST',
      }),
      invalidatesTags: (r, e, id) => [{ type: 'Referral', id }, 'Referral'],
    }),

    markDeceased: builder.mutation<ApiMessage, { id: string; body: MarkDeceasedPayload }>({
      query: ({ id, body }) => ({
        url: SHARED_REFERRAL_ROUTES.DECEASED(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (r, e, { id }) => [
        { type: 'Referral', id },
        'AssignedReferral',
        'Referral',
      ],
    }),
  }),
});

export const {
  useGetAssignedReferralsQuery,
  useGrantConsultAccessMutation,
  useRevokeConsultAccessMutation,
  useCancelReferralMutation,
  useRejectAfterSendMutation,
  useMarkDeceasedMutation,
} = doctorReferralApi;
