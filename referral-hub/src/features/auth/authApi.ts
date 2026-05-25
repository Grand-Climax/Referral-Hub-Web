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

export type MfaChannel = 'email' | 'sms'

interface LoginCredentials {
    email: string
    password: string
    /**
     * Only meaningful when the backend has `sms_otp_enabled = true`. Omit
     * to use the server default (email). The response's `channel` is the
     * source of truth for which channel actually received the OTP — SMS
     * may fall back to email if the user has no phone on file.
     */
    mfa_channel?: MfaChannel
}

interface CompleteAuthResponse {
    kind: 'complete'
    access_token: string
    refresh_token: string
    user: {
        id: string
        role: string
        hospitalId: string
        departmentId?: string
    }
}

interface MfaChallengeResponse {
    kind: 'mfa'
    mfa_token: string
    channel: MfaChannel
}

/**
 * Login responds with one of two shapes depending on the system's MFA
 * configuration. The discriminated union forces every consumer to handle
 * both — if it has `kind === 'complete'` the user is fully authenticated;
 * if it has `kind === 'mfa'` the caller must prompt for an OTP and call
 * `mfaVerify` with the mfa_token before the user is logged in.
 */
export type LoginResponse = CompleteAuthResponse | MfaChallengeResponse

type RawLoginBody = {
  access_token?: string
  refresh_token?: string
  mfa_token?: string
  channel?: MfaChannel
}

function unwrapEnvelope<T extends object>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const nested = (raw as { data?: T }).data
    if (nested) return nested
  }
  return (raw ?? {}) as T
}

function buildCompleteResponse(body: RawLoginBody): CompleteAuthResponse {
  const decoded: any = jwtDecode(body.access_token as string)
  return {
    kind: 'complete',
    access_token: body.access_token as string,
    refresh_token: body.refresh_token ?? '',
    user: {
      id: decoded.sub,
      role: decoded.role,
      hospitalId: decoded.hosp_id,
      departmentId: decoded.dept_id,
    },
  }
}

/**
 * Write cookies + prime authSlice + reset cached API data. Shared between
 * the three flows that fully authenticate a user: normal login, MFA
 * verify, and reset-password auto-login. Keep this idempotent — it's the
 * single place where "user is now logged in" side-effects live.
 */
async function applyCompleteAuth(
  dispatch: (action: unknown) => unknown,
  data: CompleteAuthResponse,
) {
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
  const { resetDataApiCaches } = await import('@/lib/resetApiCaches')
  resetDataApiCaches(dispatch as import('@/lib/store').AppDispatch)
  dispatch(
    authApi.util.invalidateTags([{ type: 'Auth', id: 'CURRENT_USER' }]),
  )
}

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        /**
         * Primary authentication. Returns one of two shapes:
         *   • `kind: 'complete'` — MFA is off system-wide. Tokens are
         *     written immediately and the user is fully signed in.
         *   • `kind: 'mfa'` — MFA is on. The response carries a short-
         *     lived `mfa_token` (~5 min) that the caller must pass to
         *     `mfaVerify` along with the user's 6-digit OTP. The cookies
         *     are NOT written in this branch — until OTP succeeds the
         *     user is not authenticated for any protected endpoint.
         */
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: AUTH_ROUTES.LOGIN,
                method: 'POST',
                body: credentials,
            }),
            transformResponse: (response: unknown): LoginResponse => {
                const body = unwrapEnvelope<RawLoginBody>(response)
                if (body.access_token) {
                    return buildCompleteResponse(body)
                }
                if (body.mfa_token) {
                    return {
                        kind: 'mfa',
                        mfa_token: body.mfa_token,
                        channel: body.channel ?? 'email',
                    }
                }
                // Defensive: the server promises one of the two shapes.
                // If neither field is present we throw so RTK surfaces an
                // error rather than handing back an invalid LoginResponse.
                throw new Error('Login response missing both access_token and mfa_token')
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    if (data.kind === 'complete') {
                        await applyCompleteAuth(dispatch, data)
                    }
                    // For `mfa`: do nothing here — the OTP step has to
                    // succeed before we touch cookies or authSlice.
                } catch (error) {
                    console.error('Login failed:', error)
                }
            },
        }),
        /**
         * MFA OTP verification. The `mfa_token` from the login response
         * is sent as a Bearer header (NOT in the body — that's the body
         * for the OTP code only). On success this finalises the login,
         * so cookies/authSlice updates happen here just like in a normal
         * login.
         */
        mfaVerify: builder.mutation<
            CompleteAuthResponse,
            { mfa_token: string; code: string }
        >({
            query: ({ mfa_token, code }) => ({
                url: AUTH_ROUTES.MFA_VERIFY,
                method: 'POST',
                body: { code },
                headers: { Authorization: `Bearer ${mfa_token}` },
            }),
            transformResponse: (response: unknown): CompleteAuthResponse => {
                const body = unwrapEnvelope<RawLoginBody>(response)
                if (!body.access_token) {
                    throw new Error('MFA verify did not return access_token')
                }
                return buildCompleteResponse(body)
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    await applyCompleteAuth(dispatch, data)
                } catch (error) {
                    console.error('MFA verify failed:', error)
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
        /**
         * Step 1 of the 3-step forgot-password flow.
         * The backend always returns the same generic message regardless of
         * whether the email exists (anti-enumeration), so the UI should treat
         * a 200 as "if that account exists, a code has been sent."
         */
        forgotPassword: builder.mutation<
            { success?: boolean; message?: string },
            { email: string }
        >({
            query: (body) => ({
                url: AUTH_ROUTES.FORGOT_PASSWORD,
                method: 'POST',
                body,
            }),
            transformResponse: (raw: unknown) => {
                if (raw && typeof raw === 'object' && 'data' in raw) {
                    const data = (raw as { data?: { success?: boolean; message?: string } }).data
                    if (data) return data
                }
                return raw as { success?: boolean; message?: string }
            },
        }),
        /**
         * Step 2 — verify the OTP and receive a short-lived (~15 min) reset
         * token. The token is returned in the JSON body, NOT a cookie, so the
         * caller must hold it in memory and pass it as a Bearer header in
         * step 3. Never persist it to localStorage.
         */
        verifyForgotPassword: builder.mutation<
            { success?: boolean; message?: string; reset_token?: string },
            { email: string; code: string }
        >({
            query: (body) => ({
                url: AUTH_ROUTES.FORGOT_PASSWORD_VERIFY,
                method: 'POST',
                body,
            }),
            transformResponse: (raw: unknown) => {
                if (raw && typeof raw === 'object' && 'data' in raw) {
                    const data = (raw as { data?: { success?: boolean; message?: string; reset_token?: string } }).data
                    if (data) return data
                }
                return raw as { success?: boolean; message?: string; reset_token?: string }
            },
        }),
        /**
         * Step 3 — reset password & auto-login.
         *
         * IMPORTANT: per the backend contract the reset_token must be sent
         * as `Authorization: Bearer <reset_token>` (NOT in the body). The
         * baseQuery already skips its own auth header for this endpoint
         * (see PUBLIC_AUTH_URLS) so the per-request header we set here is
         * the one that reaches the server.
         *
         * On success the response carries fresh `access_token` +
         * `refresh_token`, so we treat this exactly like a normal login —
         * write cookies, decode the JWT for the role, prime authSlice,
         * reset cached caches. The component just needs to redirect.
         */
        resetPassword: builder.mutation<
            CompleteAuthResponse,
            { reset_token: string; new_password: string }
        >({
            query: ({ reset_token, new_password }) => ({
                url: AUTH_ROUTES.RESET_PASSWORD,
                method: 'POST',
                body: { new_password },
                headers: { Authorization: `Bearer ${reset_token}` },
            }),
            transformResponse: (raw: unknown): CompleteAuthResponse => {
                const body = unwrapEnvelope<RawLoginBody>(raw)
                if (!body.access_token) {
                    throw new Error('Reset password did not return access_token')
                }
                return buildCompleteResponse(body)
            },
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const { data } = await queryFulfilled
                    await applyCompleteAuth(dispatch, data)
                } catch (error) {
                    console.error('Auto-login after password reset failed:', error)
                }
            },
        }),
    }),
})

export const {
    useLoginMutation,
    useMfaVerifyMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useGetCurrentUserQuery,
    useGetUserByIdQuery,
    useForgotPasswordMutation,
    useVerifyForgotPasswordMutation,
    useResetPasswordMutation,
} = authApi
