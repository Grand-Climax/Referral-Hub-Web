import { createApi } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'
import { baseQueryWithReauth } from '@/lib/baseQuery'
import { AUTH_ROUTES } from '@/config/api'
import { jwtDecode } from 'jwt-decode'
import { setUser } from '@/redux/slices/authSlice'
import { UserProfile } from '@/types/user'
import {
  setAuthCookies,
  setAccessTokenCookie,
} from '@/lib/authSession'

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

type TokenResponse = {
  access_token: string
  refresh_token?: string
}

function unwrapTokenResponse(raw: unknown): TokenResponse {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const nested = (raw as { data?: TokenResponse }).data
    if (nested?.access_token) return nested
  }
  return raw as TokenResponse
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
            transformResponse: (response: unknown) => {
                const tokens = unwrapTokenResponse(response)
                const decoded: any = jwtDecode(tokens.access_token)
                return {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token ?? '',
                    user: {
                        id: decoded.sub,
                        role: decoded.role,
                        hospitalId: decoded.hosp_id,
                        departmentId: decoded.dept_id,
                    },
                }
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled

                    setAuthCookies(data.access_token, data.refresh_token)

                    dispatch(
                        setUser({
                            user: {
                                role: data.user.role,
                                hospitalId: data.user.hospitalId,
                                departmentId: data.user.departmentId,
                            },
                        }),
                    )

                    // Clear previous account data without resetting authApi mid-login.
                    const { resetDataApiCaches } = await import('@/lib/resetApiCaches')
                    resetDataApiCaches(dispatch)
                    dispatch(
                        authApi.util.invalidateTags([
                            { type: 'Auth', id: 'CURRENT_USER' },
                        ]),
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
                    const { resetAuthSession } = await import('@/lib/resetApiCaches')
                    resetAuthSession(dispatch)
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
                    setAccessTokenCookie(data.access_token)
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
