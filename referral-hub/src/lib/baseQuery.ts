import { fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query'
import Cookies from 'js-cookie'
import { API_BASE_URL, AUTH_ROUTES } from '@/config/api'
import { logout } from '@/redux/slices/authSlice'

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
        const token = Cookies.get('access_token')
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    },
})

// Keep backward compat — old name still works
export const baseQuery = rawBaseQuery

let refreshPromise: Promise<boolean> | null = null

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions)

    if (result.error && result.error.status === 401) {
        // If a refresh is already in progress, wait for it
        if (refreshPromise) {
            const isRefreshed = await refreshPromise
            if (isRefreshed) {
                // Retry the original request with the new token
                return await rawBaseQuery(args, api, extraOptions)
            }
            return result
        }

        // No refresh in progress, start one
        refreshPromise = (async () => {
            try {
                const refreshToken = Cookies.get('refresh_token')
                if (!refreshToken) return false

                const refreshResult = await rawBaseQuery(
                    {
                        url: AUTH_ROUTES.REFRESH,
                        method: 'POST',
                        body: { refresh_token: refreshToken },
                    },
                    api,
                    extraOptions
                )

                if (refreshResult.data) {
                    const { access_token } = refreshResult.data as { access_token: string }
                    Cookies.set('access_token', access_token, {
                        expires: 1,
                        secure: true,
                        sameSite: 'strict',
                    })
                    return true
                }
                return false
            } catch (err) {
                return false
            } finally {
                refreshPromise = null
            }
        })()

        const isRefreshed = await refreshPromise
        if (isRefreshed) {
            // Retry the original request for the one that initiated the refresh
            result = await rawBaseQuery(args, api, extraOptions)
        } else {
            // Refresh truly failed — force logout
            forceLogout(api)
        }
    }

    return result
}

function forceLogout(api: any) {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    api.dispatch(logout())
    // Redirect to sign-in on the client side
    if (typeof window !== 'undefined') {
        window.location.href = '/login'
    }
}
