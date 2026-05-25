import Cookies from "js-cookie";
import type { AppDispatch } from "@/lib/store/index";
import { logout as logoutAction } from "@/redux/slices/authSlice";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function authCookieOptions() {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  return {
    secure,
    sameSite: "strict" as const,
  };
}

export function clearAuthCookies() {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
}

export function notifyAuthTokenChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-token-changed"));
  }
}

/** Clears cookies and Redux auth state (no RTK cache reset — safe for baseQuery imports). */
export function clearAuthSession(dispatch: AppDispatch) {
  clearAuthCookies();
  dispatch(logoutAction());
  notifyAuthTokenChanged();
}

export function setAccessTokenCookie(accessToken: string) {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    ...authCookieOptions(),
    expires: 1,
  });
  notifyAuthTokenChanged();
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const options = authCookieOptions();
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { ...options, expires: 1 });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { ...options, expires: 7 });
  notifyAuthTokenChanged();
}
