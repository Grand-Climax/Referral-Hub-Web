import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { HOSPITAL_ADMIN_ROUTES } from '@/config/api';
import {
  HospitalAdminStaff,
  HospitalAdminStaffDetail,
  HospitalAdminStaffResponse,
  GetStaffParams,
  CreateStaffPayload,
  ReplaceStaffPayload,
  ChangeRolePayload,
  UpdateStaffPayload,
  ReferralStatusHistory,
} from '@/types/hospital-admin';

function unwrapStaffDetail(
  raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail },
): HospitalAdminStaffDetail {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
    return raw.data;
  }
  return raw as HospitalAdminStaffDetail;
}

function buildStaffListQuery(params?: GetStaffParams): string {
  const searchParams = new URLSearchParams();
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 50;
  searchParams.set('page', String(page));
  searchParams.set('page_size', String(pageSize));
  if (params?.role) searchParams.set('role', params.role);
  if (params?.name) searchParams.set('name', params.name);
  if (params?.email) searchParams.set('email', params.email);
  if (params?.dept_id) searchParams.set('dept_id', params.dept_id);
  if (typeof params?.is_active === 'boolean') {
    searchParams.set('is_active', String(params.is_active));
  }
  return `${HOSPITAL_ADMIN_ROUTES.STAFF}?${searchParams.toString()}`;
}

export const hospitalAdminApi = createApi({
  reducerPath: 'hospitalAdminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['HospitalAdminStaff', 'ReferralStatusHistory'],
  endpoints: (builder) => ({
    getStaff: builder.query<HospitalAdminStaffResponse, GetStaffParams | undefined>({
      query: (params) => buildStaffListQuery(params),
      providesTags: ['HospitalAdminStaff'],
    }),
    getStaffById: builder.query<HospitalAdminStaffDetail, string>({
      query: (id) => HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
      transformResponse: (raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail }) =>
        unwrapStaffDetail(raw),
      providesTags: (result, error, id) => [{ type: 'HospitalAdminStaff', id }],
    }),
    updateStaff: builder.mutation<
      HospitalAdminStaffDetail,
      { id: string } & UpdateStaffPayload
    >({
      query: ({ id, ...body }) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_BY_ID(id),
        method: 'PATCH',
        body,
      }),
      transformResponse: (raw: HospitalAdminStaffDetail | { data: HospitalAdminStaffDetail }) =>
        unwrapStaffDetail(raw),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
    }),
    updateStaffActivation: builder.mutation<unknown, { id: string; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: HOSPITAL_ADMIN_ROUTES.STAFF_ACTIVATION(id),
        method: 'PATCH',
        body: { is_active },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'HospitalAdminStaff', id }, 'HospitalAdminStaff'],
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
  useUpdateStaffMutation,
  useUpdateStaffActivationMutation,
  useDeleteStaffMutation,
  useReplaceStaffMutation,
  useChangeStaffRoleMutation,
  useGetReferralStatusHistoryQuery,
} = hospitalAdminApi;
