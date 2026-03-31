import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { HOSPITAL_ROUTES } from '@/config/api'
import { Hospital } from '@/types/hospital'

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
        }),
    }),
})

export const { useGetHospitalByIdQuery } = hospitalsApi
