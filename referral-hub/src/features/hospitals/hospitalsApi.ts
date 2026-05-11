import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { HOSPITAL_ROUTES, REFERENCE_ROUTES } from '@/config/api'
import { Hospital, Department } from '@/types/hospital'

export const hospitalsApi = createApi({
    reducerPath: 'hospitalsApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Hospital'],
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
    }),
})

export const { useGetHospitalByIdQuery, useGetHospitalsQuery, useGetDepartmentsQuery } = hospitalsApi
