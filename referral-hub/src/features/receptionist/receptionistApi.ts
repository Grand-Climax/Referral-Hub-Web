import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { RECEPTIONIST_ROUTES } from '@/config/api';
import {
  ReceptionistReferral,
  ReceptionistPaginatedResponse,
  ReceptionistScheduleItem,
  ReceptionistWalkInPayload,
  AssignDoctorPayload,
  MarkMissedPayload,
  ReceptionistReferralDetail,
  ReceptionistListParams
} from '@/types/receptionist';

export const receptionistApi = createApi({
  reducerPath: 'receptionistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReceptionistReferral', 'ReceptionistSchedule'],
  endpoints: (builder) => ({
    // GET /api/v1/receptionist - List referrals with filters
    getReferrals: builder.query<ReceptionistPaginatedResponse<ReceptionistReferral>, ReceptionistListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', String(params?.page ?? 1));
        queryParams.append('limit', String(params?.limit ?? 20));
        
        if (params?.status) queryParams.append('status', params.status);
        if (params?.region) queryParams.append('region', params.region);
        if (params?.patient_name) queryParams.append('patient_name', params.patient_name);
        if (params?.sort) queryParams.append('sort', params.sort);
        
        return `${RECEPTIONIST_ROUTES.LIST}?${queryParams.toString()}`;
      },
      providesTags: ['ReceptionistReferral'],
    }),
    
    // GET /api/v1/receptionist/schedule - Get scheduled triage records for next 48 hours
    getSchedule: builder.query<{ [key: string]: any }, void>({
      query: () => RECEPTIONIST_ROUTES.SCHEDULE,
      providesTags: ['ReceptionistSchedule'],
    }),
    
    // POST /api/v1/receptionist/walk-in - Register walk-in patient
    registerWalkIn: builder.mutation<{ [key: string]: any }, ReceptionistWalkInPayload>({
      query: (body) => ({
        url: RECEPTIONIST_ROUTES.WALK_IN,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReceptionistReferral', 'ReceptionistSchedule'],
    }),
    
    // GET /api/v1/receptionist/{id} - Get detailed referral information
    getReferralById: builder.query<ReceptionistReferralDetail, string>({
      query: (id) => RECEPTIONIST_ROUTES.GET_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }],
    }),
    
    // POST /api/v1/receptionist/{id}/arrive - Mark patient as arrived
    markPatientArrival: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: RECEPTIONIST_ROUTES.ARRIVE(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }, 'ReceptionistReferral', 'ReceptionistSchedule'],
    }),
    
    // POST /api/v1/receptionist/{id}/assign-doctor - Assign treating doctor
    assignDoctor: builder.mutation<{ success: boolean; message: string }, { id: string } & AssignDoctorPayload>({
      query: ({ id, ...body }) => ({
        url: RECEPTIONIST_ROUTES.ASSIGN_DOCTOR(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ReceptionistReferral', id }, 'ReceptionistReferral', 'ReceptionistSchedule'],
    }),
    
    // POST /api/v1/receptionist/{id}/miss - Mark appointment as missed
    markMissed: builder.mutation<{ success: boolean; message: string }, { id: string; body: MarkMissedPayload }>({
      query: ({ id, body }) => ({
        url: RECEPTIONIST_ROUTES.MISS(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ReceptionistReferral', id }, 'ReceptionistReferral', 'ReceptionistSchedule'],
    }),
  }),
});

export const {
  useGetReferralsQuery,
  useGetScheduleQuery,
  useRegisterWalkInMutation,
  useGetReferralByIdQuery,
  useMarkPatientArrivalMutation,
  useAssignDoctorMutation,
  useMarkMissedMutation,
} = receptionistApi;
