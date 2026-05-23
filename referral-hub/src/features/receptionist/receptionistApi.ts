import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { RECEPTIONIST_ROUTES } from '@/config/api';
import {
  ReceptionistReferral,
  ReceptionistPaginatedResponse,
  ReceptionistScheduleItem,
  AssignDoctorPayload,
  ReceptionistQueryParams
} from '@/types/receptionist';

export const receptionistApi = createApi({
  reducerPath: 'receptionistApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ReceptionistReferral', 'ReceptionistSchedule'],
  endpoints: (builder) => ({
    // List receptionist-visible referrals (hospital-scoped from token)
    getReferrals: builder.query<ReceptionistPaginatedResponse<ReceptionistReferral>, ReceptionistQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append('page', String(params?.page ?? 1));
        queryParams.append('limit', String(params?.limit ?? 20));
        
        if (params?.status) queryParams.append('status', params.status);
        if (params?.arrival_status) queryParams.append('arrival_status', params.arrival_status);
        if (params?.urgency) queryParams.append('urgency', params.urgency);
        if (params?.department_id) queryParams.append('department_id', params.department_id);
        
        return `${RECEPTIONIST_ROUTES.LIST}?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        console.log('Raw API Response:', response);
        
        // Handle different response structures from backend
        if (response?.data) {
          // If data is nested
          if (Array.isArray(response.data)) {
            return {
              data: response.data,
              page: response.page || 1,
              limit: response.limit || 20,
              total: response.total || response.data.length
            };
          } else if (response.data.referrals) {
            return {
              data: response.data.referrals,
              page: response.data.page || 1,
              limit: response.data.limit || 20,
              total: response.data.total || response.data.referrals.length
            };
          } else {
            return response.data;
          }
        }
        
        // If response is already in correct format
        if (Array.isArray(response)) {
          return {
            data: response,
            page: 1,
            limit: 20,
            total: response.length
          };
        }
        
        // Default return
        return response;
      },
      providesTags: ['ReceptionistReferral'],
    }),
    
    // View schedule (operational queue for next 48h)
    getSchedule: builder.query<ReceptionistScheduleItem[], void>({
      query: () => RECEPTIONIST_ROUTES.SCHEDULE,
      providesTags: ['ReceptionistSchedule'],
    }),
    
    // Get referral details (must belong to receptionist's hospital)
    getReferralById: builder.query<ReceptionistReferral, string>({
      query: (id) => RECEPTIONIST_ROUTES.GET_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'ReceptionistReferral', id }],
    }),
    
    // Confirm patient arrival (moves arrival_status to ARRIVED)
    markPatientArrival: builder.mutation<void, string>({
      query: (id) => ({
        url: RECEPTIONIST_ROUTES.ARRIVE(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ReceptionistReferral', id }, 
        'ReceptionistReferral', 
        'ReceptionistSchedule'
      ],
    }),
    
    // Assign treating doctor (only after arrival; doctor must be RECEIVING_SPECIALIST)
    assignDoctor: builder.mutation<void, { id: string } & AssignDoctorPayload>({
      query: ({ id, ...body }) => ({
        url: RECEPTIONIST_ROUTES.ASSIGN_DOCTOR(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ReceptionistReferral', id }, 
        'ReceptionistReferral'
      ],
    }),
    
    // Mark missed appointment (sets arrival_status to MISSED)
    markMissed: builder.mutation<void, string>({
      query: (id) => ({
        url: RECEPTIONIST_ROUTES.MISS(id),
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'ReceptionistReferral', id }, 
        'ReceptionistReferral', 
        'ReceptionistSchedule'
      ],
    }),
  }),
});

export const {
  useGetReferralsQuery,
  useGetScheduleQuery,
  useGetReferralByIdQuery,
  useMarkPatientArrivalMutation,
  useAssignDoctorMutation,
  useMarkMissedMutation,
} = receptionistApi;
