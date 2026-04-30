import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { HOSPITAL_ADMIN_ROUTES } from '@/config/api';
import {
  HospitalAdminStaff,
  HospitalAdminStaffResponse,
  CreateStaffPayload,
  ReplaceStaffPayload,
  ChangeRolePayload,
  ReferralStatusHistory,
} from '@/types/hospital-admin';

export const hospitalAdminApi = createApi({
  reducerPath: 'hospitalAdminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['HospitalAdminStaff', 'ReferralStatusHistory'],
  endpoints: (builder) => ({
    getStaff: builder.query<HospitalAdminStaffResponse, { page?: number; limit?: number } | void>({
      query: (params) => {
        const pageNum = params?.page ?? 1;
        const limit = params?.limit ?? 50;
        return `${HOSPITAL_ADMIN_ROUTES.STAFF}?page=${pageNum}&limit=${limit}`;
      },
      providesTags: ['HospitalAdminStaff'],
    }),
    getStaffById: builder.query<HospitalAdminStaff, string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'HospitalAdminStaff', id }],
    }),
    createStaff: builder.mutation<HospitalAdminStaff, CreateStaffPayload>({
      query: (body) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HospitalAdminStaff'],
    }),
    deleteStaff: builder.mutation<void, string>({
      query: (id) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['HospitalAdminStaff'],
    }),
    replaceStaff: builder.mutation<HospitalAdminStaff, { id: string } & ReplaceStaffPayload>({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.REPLACE_STAFF(id),
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    changeStaffRole: builder.mutation<HospitalAdminStaff, { id: string } & ChangeRolePayload>({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.CHANGE_ROLE(id),
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    getReferralStatusHistory: builder.query<ReferralStatusHistory[], string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.STATUS_HISTORY(id),
      providesTags: (result, error, id) => [{ type: 'ReferralStatusHistory', id }],
    }),
  }),
});

export const {
  useGetStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useDeleteStaffMutation,
  useReplaceStaffMutation,
  useChangeStaffRoleMutation,
  useGetReferralStatusHistoryQuery,
} = hospitalAdminApi;
