import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'
import { API_BASE_URL } from '@/config/api'

export const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = Cookies.get('access_token')
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    },
})
