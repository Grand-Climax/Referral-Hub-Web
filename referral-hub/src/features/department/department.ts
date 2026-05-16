import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { DEPARTMENT_ROUTES } from '@/config/api'
import type {
    CreateDepartmentRequest,
    Department,
    UpdateDepartmentRequest,
} from '@/types/hospital'

export const departmentApi = createApi({
    reducerPath: 'departmentApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Department', 'DepartmentList'],
    endpoints: (builder) => ({
        getDepartments: builder.query<Department[], void>({
            query: () => ({
                url: DEPARTMENT_ROUTES.LIST,
                method: 'GET',
            }),
            transformResponse: (response: Department[] | { data: Department[] }) => {
                if (Array.isArray(response)) return response;
                return response.data || [];
            },
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({
                              type: 'Department' as const,
                              id,
                          })),
                          { type: 'DepartmentList' as const, id: 'LIST' },
                      ]
                    : [{ type: 'DepartmentList' as const, id: 'LIST' }],
        }),
        getDepartmentById: builder.query<Department, string>({
            query: (id) => ({
                url: DEPARTMENT_ROUTES.GET_BY_ID(id),
                method: 'GET',
            }),
            transformResponse: (response: Department | { data: Department }) => {
                if ('data' in response && response.data) return response.data as Department;
                return response as Department;
            },
            providesTags: (_result, _err, id) => [{ type: 'Department', id }],
        }),
        createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
            query: (body) => ({
                url: DEPARTMENT_ROUTES.CREATE,
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'DepartmentList', id: 'LIST' }],
        }),
        updateDepartment: builder.mutation<
            Department,
            { id: string; body: UpdateDepartmentRequest }
        >({
            query: ({ id, body }) => ({
                url: DEPARTMENT_ROUTES.UPDATE(id),
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _err, arg) => [
                { type: 'Department', id: arg.id },
                { type: 'DepartmentList', id: 'LIST' },
            ],
        }),
        deleteDepartment: builder.mutation<void, string>({
            query: (id) => ({
                url: DEPARTMENT_ROUTES.DELETE(id),
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _err, id) => [
                { type: 'Department', id },
                { type: 'DepartmentList', id: 'LIST' },
            ],
        }),
    }),
})

export const {
    useGetDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} = departmentApi
