import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { HOSPITAL_ROUTES, REFERENCE_ROUTES } from '@/config/api'
import type {
    CreateHospitalRequest,
    Department,
    Hospital,
    HospitalDepartmentLink,
    LinkHospitalDepartmentRequest,
    UpdateHospitalRequest,
} from '@/types/hospital'

export const hospitalsApi = createApi({
    reducerPath: 'hospitalsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Hospital', 'HospitalList', 'HospitalDepartments'],
    endpoints: (builder) => ({
        getHospitalById: builder.query<Hospital, string>({
            query: (id) => ({
                url: HOSPITAL_ROUTES.GET_BY_ID(id),
                method: 'GET',
            }),
            transformResponse: (response: Hospital | { data: Hospital }) => {
                if ('data' in response && response.data) return response.data;
                return response as Hospital;
            },
            providesTags: (_result, _err, id) => [{ type: 'Hospital', id }],
        }),
        getHospitals: builder.query<Hospital[], void>({
            query: () => ({
                url: REFERENCE_ROUTES.HOSPITALS,
                method: 'GET',
            }),
            transformResponse: (response: Hospital[] | { data: Hospital[] }) => {
                if (Array.isArray(response)) return response;
                return response.data || [];
            },
            providesTags: [{ type: 'HospitalList', id: 'LIST' }],
        }),
        getDepartments: builder.query<Department[], string>({
            query: (hospitalId) => ({
                url: REFERENCE_ROUTES.DEPARTMENTS(hospitalId),
                method: 'GET',
            }),
            transformResponse: (response: Department[] | { data: Department[] }) => {
                if (Array.isArray(response)) return response;
                return response.data || [];
            },
        }),
        createHospital: builder.mutation<Hospital, CreateHospitalRequest>({
            query: (body) => ({
                url: HOSPITAL_ROUTES.CREATE,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'HospitalList', id: 'LIST' }],
        }),
        updateHospital: builder.mutation<
            Hospital,
            { id: string; body: UpdateHospitalRequest }
        >({
            query: ({ id, body }) => ({
                url: HOSPITAL_ROUTES.UPDATE(id),
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: 'Hospital', id: arg.id },
                { type: 'HospitalList', id: 'LIST' },
            ],
        }),
        deleteHospital: builder.mutation<void, string>({
            query: (id) => ({
                url: HOSPITAL_ROUTES.DELETE(id),
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _err, id) => [
                { type: 'Hospital', id },
                { type: 'HospitalList', id: 'LIST' },
            ],
        }),
        getHospitalDepartments: builder.query<HospitalDepartmentLink[], string>({
            query: (hospitalId) => ({
                url: HOSPITAL_ROUTES.LIST_DEPARTMENTS(hospitalId),
                method: 'GET',
            }),
            transformResponse: (
                response:
                    | HospitalDepartmentLink[]
                    | { data: HospitalDepartmentLink[] }
                    | { departments: HospitalDepartmentLink[] }
                    | unknown,
            ): HospitalDepartmentLink[] => {
                if (Array.isArray(response)) return response;
                if (response && typeof response === 'object') {
                    const maybe = response as {
                        data?: HospitalDepartmentLink[];
                        departments?: HospitalDepartmentLink[];
                    };
                    if (Array.isArray(maybe.data)) return maybe.data;
                    if (Array.isArray(maybe.departments)) return maybe.departments;
                }
                return [];
            },
            providesTags: (_result, _err, id) => [
                { type: 'HospitalDepartments', id },
            ],
        }),
        linkHospitalDepartment: builder.mutation<
            void,
            { id: string; body: LinkHospitalDepartmentRequest }
        >({
            query: ({ id, body }) => ({
                url: HOSPITAL_ROUTES.LINK_DEPARTMENT(id),
                method: 'POST',
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: 'HospitalDepartments', id: arg.id },
            ],
        }),
        unlinkHospitalDepartment: builder.mutation<
            void,
            { id: string; deptId: string }
        >({
            query: ({ id, deptId }) => ({
                url: HOSPITAL_ROUTES.UNLINK_DEPARTMENT(id, deptId),
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: 'HospitalDepartments', id: arg.id },
            ],
        }),
    }),
})

export const {
    useGetHospitalByIdQuery,
    useGetHospitalsQuery,
    useGetDepartmentsQuery,
    useCreateHospitalMutation,
    useUpdateHospitalMutation,
    useDeleteHospitalMutation,
    useGetHospitalDepartmentsQuery,
    useLinkHospitalDepartmentMutation,
    useUnlinkHospitalDepartmentMutation,
} = hospitalsApi
