import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { RECEPTIONIST_ROUTES } from '@/config/api';
import {
  ReceptionistReferral,
  ReceptionistPaginatedResponse,
  ReceptionistScheduleItem,
  ReceptionistWalkInPayload,
  AssignDoctorPayload
} from '@/types/receptionist';

export const receptionistApi = createApi({
  reducerPath: 'receptionistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReceptionistReferral', 'ReceptionistSchedule'],
  endpoints: (builder) => ({
    getReferrals: builder.query<ReceptionistPaginatedResponse<ReceptionistReferral>, { page?: number; limit?: number } | void>({
      query: (params) => {
        const pageNum = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return `${RECEPTIONIST_ROUTES.LIST}?page=${pageNum}&limit=${limit}`;
      },
      providesTags: ['ReceptionistReferral'],
    }),
    getSchedule: builder.query<ReceptionistScheduleItem[], void>({
      query: () => RECEPTIONIST_ROUTES.SCHEDULE,
      providesTags: ['ReceptionistSchedule'],
    }),
    registerWalkIn: builder.mutation<ReceptionistReferral, ReceptionistWalkInPayload>({
      query: (body) => ({
        url: RECEPTIONIST_ROUTES.WALK_IN,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReceptionistReferral', 'ReceptionistSchedule'],
    }),
    getReferralById: builder.query<ReceptionistReferral, string>({
      query: (id) => RECEPTIONIST_ROUTES.GET_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }],
    }),
    markPatientArrival: builder.mutation<void, string>({
      query: (id) => ({
        url: RECEPTIONIST_ROUTES.ARRIVE(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }, 'ReceptionistReferral', 'ReceptionistSchedule'],
    }),
    assignDoctor: builder.mutation<void, { id: string } & AssignDoctorPayload>({
      query: ({ id, ...body }) => ({
        url: RECEPTIONIST_ROUTES.ASSIGN_DOCTOR(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'ReceptionistReferral', id }, 'ReceptionistReferral'],
    }),
    markMissed: builder.mutation<void, string>({
      query: (id) => ({
        url: RECEPTIONIST_ROUTES.MISS(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }, 'ReceptionistReferral', 'ReceptionistSchedule'],
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
