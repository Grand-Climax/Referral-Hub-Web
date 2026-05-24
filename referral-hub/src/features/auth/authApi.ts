import { createApi } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { AUTH_ROUTES } from '@/config/api'
import { jwtDecode } from 'jwt-decode'
import { setUser, logout as logoutAction } from '@/redux/slices/authSlice'
import { UserProfile } from '@/types/user'

interface LoginCredentials {
    email: string
    password: string
}

interface AuthResponse {
    access_token: string
    refresh_token: string
    user: {
        id: string
        role: string
        hospitalId: string
        departmentId?: string
    }
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginCredentials>({
            query: (credentials) => ({
                url: AUTH_ROUTES.LOGIN,
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (response: { access_token: string; refresh_token: string }) => {
                const decoded: any = jwtDecode(response.access_token)
                return {
                    ...response,
                    user: {
                        id: decoded.sub,
                        role: decoded.role,
                        hospitalId: decoded.hosp_id,
                        departmentId: decoded.dept_id,
                    }
                }
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    // Clear any cached data from a previous account before loading the new session.
                    const { resetAllApiCaches } = await import('@/lib/resetApiCaches')
                    resetAllApiCaches(dispatch)

                    Cookies.set('access_token', data.access_token, {
                        expires: 1,
                        secure: true,
                        sameSite: 'strict'
                    })
                    Cookies.set('refresh_token', data.refresh_token, {
                        expires: 7,
                        secure: true,
                        sameSite: 'strict'
                    })

                    const decoded: any = jwtDecode(data.access_token)

                    dispatch(
                        setUser({
                            user: {
                                role: decoded.role,
                                hospitalId: decoded.hosp_id,
                                departmentId: decoded.dept_id,
                            }
                        })
                    )
                } catch (error) {
                    console.error('Login failed:', error)
                }
            },
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: AUTH_ROUTES.LOGOUT,
                method: 'POST',
                body: { refresh_token: Cookies.get('refresh_token') },
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    await queryFulfilled
                } catch (error) {
                    console.error('Logout failed:', error)
                } finally {
                    Cookies.remove('access_token')
                    Cookies.remove('refresh_token')
                    dispatch(logoutAction())
                    const { resetAllApiCaches } = await import('@/lib/resetApiCaches')
                    resetAllApiCaches(dispatch)
                }
            },
        }),
        refreshToken: builder.mutation<{ access_token: string }, void>({
            query: () => ({
                url: AUTH_ROUTES.REFRESH,
                method: 'POST',
                body: { refresh_token: Cookies.get('refresh_token') },
            }),
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled
                    // Update access token
                    Cookies.set('access_token', data.access_token, {
                        expires: 1,
                        secure: true,
                        sameSite: 'strict'
                    })
                } catch (error) {
                    console.error('Token refresh failed:', error)
                }
            },
        }),
        getCurrentUser: builder.query<UserProfile, void>({
            query: () => ({
                url: AUTH_ROUTES.ME,
                method: 'GET',
            }),
            transformResponse: (raw: UserProfile | { data?: UserProfile }) => {
                if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
                    return raw.data
                }
                return raw as UserProfile
            },
            providesTags: [{ type: 'Auth', id: 'CURRENT_USER' }],
        }),
        getUserById: builder.query<UserProfile, string>({
            query: (id) => ({
                url: `/api/v1/users/${id}`,
                method: 'GET',
            }),
        }),
    }),
})

export const {
    useLoginMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useGetCurrentUserQuery,
    useGetUserByIdQuery,
} = authApi