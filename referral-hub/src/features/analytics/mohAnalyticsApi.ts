import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { MOH_ROUTES } from '@/config/api';
import type {
  MohDashboardSummary,
  DiseaseHotspotsResponse,
  HospitalLoadResponse,
  ReferralTrendsResponse,
  SeverityDistributionResponse,
  ExportReportResponse,
  MohQueryParams,
} from '@/types/moh-analytics';

export const mohAnalyticsApi = createApi({
  reducerPath: 'mohAnalyticsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['MohDashboard', 'DiseaseHotspots', 'HospitalLoad', 'ReferralTrends', 'SeverityDistribution'],
  endpoints: (builder) => ({
    // GET /api/v1/moh/dashboard/summary
    getDashboardSummary: builder.query<MohDashboardSummary, MohQueryParams | void>({
      query: (params) => ({
        url: MOH_ROUTES.DASHBOARD_SUMMARY,
        params: params || undefined,
      }),
      providesTags: ['MohDashboard'],
    }),

    // GET /api/v1/moh/disease-hotspots
    getDiseaseHotspots: builder.query<DiseaseHotspotsResponse, MohQueryParams | void>({
      query: (params) => ({
        url: MOH_ROUTES.DISEASE_HOTSPOTS,
        params: params || undefined,
      }),
      providesTags: ['DiseaseHotspots'],
    }),

    // GET /api/v1/moh/hospital-load
    getHospitalLoad: builder.query<HospitalLoadResponse, MohQueryParams | void>({
      query: (params) => ({
        url: MOH_ROUTES.HOSPITAL_LOAD,
        params: params || undefined,
      }),
      providesTags: ['HospitalLoad'],
    }),

    // GET /api/v1/moh/referral-trends
    getReferralTrends: builder.query<ReferralTrendsResponse, MohQueryParams | void>({
      query: (params) => ({
        url: MOH_ROUTES.REFERRAL_TRENDS,
        params: params || undefined,
      }),
      providesTags: ['ReferralTrends'],
    }),

    // GET /api/v1/moh/severity-distribution
    getSeverityDistribution: builder.query<SeverityDistributionResponse, MohQueryParams | void>({
      query: (params) => ({
        url: MOH_ROUTES.SEVERITY_DISTRIBUTION,
        params: params || undefined,
      }),
      providesTags: ['SeverityDistribution'],
    }),

    // GET /api/v1/moh/reports/export
    exportReport: builder.query<ExportReportResponse, MohQueryParams | void>({
      query: (params) => ({
        url: MOH_ROUTES.EXPORT_REPORT,
        params: params || undefined,
      }),
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetDiseaseHotspotsQuery,
  useGetHospitalLoadQuery,
  useGetReferralTrendsQuery,
  useGetSeverityDistributionQuery,
  useLazyExportReportQuery,
} = mohAnalyticsApi;
