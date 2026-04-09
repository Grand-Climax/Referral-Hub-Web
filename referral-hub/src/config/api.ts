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
    CREATE: '/api/v1/doctor/referrals',
    LIST: '/api/v1/doctor/referrals',
    GET_BY_ID: (id: string) => `/api/v1/doctor/referrals/${id}`,
    RESUBMIT: (id: string) => `/api/v1/doctor/referrals/${id}/submit`,
} as const;

export const PATIENT_ROUTES = {
    CREATE: '/api/v1/patients',
    LOOKUP: '/api/v1/patients/lookup',
} as const;

export const DEPARTMENT_ROUTES = {
    LIST: '/api/v1/departments',
    GET_BY_ID: (id: string) => `/api/v1/departments/${id}`,
} as const;

export const REFERENCE_ROUTES = {
    HOSPITALS: '/api/v1/reference/hospitals',
    NETWORKED_HOSPITALS: '/api/v1/reference/networked-hospitals',
    DEPARTMENTS: (hospitalId: string) => `/api/v1/reference/hospitals/${hospitalId}/departments`,
    LIAISONS: '/api/v1/reference/liaisons',
    ICD10_CODES: '/api/v1/reference/icd-codes',
} as const;

export const LIAISON_ROUTES = {
    LIST: '/api/v1/liaison/referrals/',
    GET_BY_ID: (id: string) => `/api/v1/liaison/referrals/${id}`,
    FORWARD: (id: string) => `/api/v1/liaison/referrals/${id}/forward`,
    READ: (id: string) => `/api/v1/liaison/referrals/${id}/read`,
    REJECT: (id: string) => `/api/v1/liaison/referrals/${id}/reject`,
    REVISE: (id: string) => `/api/v1/liaison/referrals/${id}/revise`,
} as const;

export const SPECIALIST_ROUTES = {
    LIST: '/api/v1/specialist/referrals',
    GET_BY_ID: (id: string) => `/api/v1/specialist/referrals/${id}`,
    ACCEPT: (id: string) => `/api/v1/specialist/referrals/${id}/accept`,
    REJECT: (id: string) => `/api/v1/specialist/referrals/${id}/reject`,
} as const;