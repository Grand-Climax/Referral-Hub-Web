export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const AUTH_ROUTES = {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/users/me',
} as const;

export const HOSPITAL_ROUTES = {
    GET_BY_ID: (id: string) => `/api/v1/hospitals/${id}`,
} as const;
