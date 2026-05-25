import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { CLINICAL_ROUTES } from '@/config/api';
import type {
  ClinicalUpdatePayload,
  ClinicalUpdateRecord,
  RecordOutcomePayload,
} from '@/types/clinical';

function unwrapList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown>;
    if (Array.isArray(r.data)) return r.data as T[];
    if (Array.isArray(r.history)) return r.history as T[];
    if (Array.isArray(r.updates)) return r.updates as T[];
  }
  return [];
}

export const clinicalApi = createApi({
  reducerPath: 'clinicalApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ClinicalHistory', 'Referral'],
  endpoints: (builder) => ({
    getClinicalHistory: builder.query<ClinicalUpdateRecord[], string>({
      query: (referralId) => CLINICAL_ROUTES.HISTORY(referralId),
      transformResponse: (raw: unknown) => unwrapList<ClinicalUpdateRecord>(raw),
      providesTags: (result, error, referralId) => [
        { type: 'ClinicalHistory', id: referralId },
      ],
    }),

    addClinicalUpdate: builder.mutation<
      { success?: boolean; message?: string },
      { referralId: string; body: ClinicalUpdatePayload }
    >({
      query: ({ referralId, body }) => ({
        url: CLINICAL_ROUTES.UPDATES(referralId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { referralId }) => [
        { type: 'ClinicalHistory', id: referralId },
        { type: 'Referral', id: referralId },
      ],
    }),

    recordOutcome: builder.mutation<
      { success?: boolean; message?: string },
      { referralId: string; body: RecordOutcomePayload }
    >({
      query: ({ referralId, body }) => ({
        url: CLINICAL_ROUTES.OUTCOME(referralId),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { referralId }) => [
        { type: 'ClinicalHistory', id: referralId },
        { type: 'Referral', id: referralId },
        'Referral',
      ],
    }),
  }),
});

export const {
  useGetClinicalHistoryQuery,
  useAddClinicalUpdateMutation,
  useRecordOutcomeMutation,
} = clinicalApi;
