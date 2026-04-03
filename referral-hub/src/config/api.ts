export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const AUTH_ROUTES = {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/users/me',
} as const;

export const HOSPITAL_ROUTES = {
    GET_BY_ID: (id: string) => `/api/v1/hospitals/${id}`,
} as const;

export const REFERRAL_ROUTES = {
    CREATE: '/api/v1/referrals',
    LIST: '/api/v1/referrals',
} as const;

export const PATIENT_ROUTES = {
    CREATE: '/api/v1/patients',
    LOOKUP: '/api/v1/patients/lookup',
} as const;

export const REFERENCE_ROUTES = {
    HOSPITALS: '/api/v1/reference/hospitals',
    NETWORKED_HOSPITALS: '/api/v1/reference/networked-hospitals',
    DEPARTMENTS: (hospitalId: string) => `/api/v1/reference/hospitals/${hospitalId}/departments`,
    LIAISONS: '/api/v1/reference/liaisons',
    ICD10_CODES: '/api/v1/reference/icd-codes',
} as const;
