import { fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query'
import Cookies from 'js-cookie'
import { API_BASE_URL, AUTH_ROUTES } from '@/config/api'
import {
  authCookieOptions,
  notifyAuthTokenChanged,
} from '@/lib/authSession'

function getRequestUrl(args: string | FetchArgs): string {
  if (typeof args === 'string') return args
  return args.url
}

function isPublicAuthRequest(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args)
  return (
    url === AUTH_ROUTES.LOGIN ||
    url.endsWith(AUTH_ROUTES.LOGIN) ||
    url === AUTH_ROUTES.REFRESH ||
    url.endsWith(AUTH_ROUTES.REFRESH)
  )
}

function isLoginRequest(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args)
  return url === AUTH_ROUTES.LOGIN || url.endsWith(AUTH_ROUTES.LOGIN)
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { arg }) => {
    if (isLoginRequest(arg)) {
      return headers
    }

    const token = Cookies.get('access_token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

export const baseQuery = rawBaseQuery

let refreshPromise: Promise<boolean> | null = null

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401 && !isPublicAuthRequest(args)) {
    if (refreshPromise) {
      const isRefreshed = await refreshPromise
      if (isRefreshed) {
        return await rawBaseQuery(args, api, extraOptions)
      }
      return result
    }

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
          extraOptions,
        )

        if (refreshResult.data) {
          const { access_token } = refreshResult.data as { access_token: string }
          Cookies.set('access_token', access_token, {
            ...authCookieOptions(),
            expires: 1,
          })
          notifyAuthTokenChanged()
          return true
        }
        return false
      } catch {
        return false
      } finally {
        refreshPromise = null
      }
    })()

    const isRefreshed = await refreshPromise
    if (isRefreshed) {
      result = await rawBaseQuery(args, api, extraOptions)
    } else {
      void forceLogout(api)
    }
  }

  return result
}

async function forceLogout(api: { dispatch: (action: unknown) => void }) {
  const { resetAuthSession } = await import('@/lib/resetApiCaches')
  resetAuthSession(api.dispatch as import('@/lib/store').AppDispatch)
}
