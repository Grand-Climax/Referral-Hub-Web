import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { DEPARTMENT_ROUTES } from '@/config/api'
import { Department } from '@/types/hospital'

export const departmentApi = createApi({
    reducerPath: 'departmentApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Department'],
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
        }),
    }),
})

export const { useGetDepartmentsQuery, useGetDepartmentByIdQuery } = departmentApi
