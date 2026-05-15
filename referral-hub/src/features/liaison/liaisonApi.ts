import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { LIAISON_ROUTES } from "@/config/api";
import { Referral } from "@/types/referral";
import type {
  LiaisonDashboardStats,
  LiaisonDashboardStatsResponse,
  LiaisonReviewChecklist,
} from "@/types/liaison";

import { ReferralListPaginatedResponse } from "@/types/referral-list";

export const liaisonApi = createApi({
  reducerPath: "liaisonApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Referral", "ReviewChecklist", "LiaisonDashboardStats"],
  endpoints: (builder) => ({
    getReferrals: builder.query<
      ReferralListPaginatedResponse,
      {
        page?: number;
        limit?: number;
        page_size?: number;
        status?: string;
        listType?: "all" | "approved" | "rejected";
      } | void
    >({
      query: (params) => {
        const pageNum = params?.page ?? 1;
        const pageSize = params?.limit ?? params?.page_size ?? 10;
        const url =
          params?.listType === "approved"
            ? LIAISON_ROUTES.APPROVED
            : params?.listType === "rejected"
              ? LIAISON_ROUTES.REJECTED
              : LIAISON_ROUTES.LIST;

        return {
          url,
          params: {
            page: pageNum,
            limit: pageSize,
            ...(params?.status && !params?.listType ? { status: params.status } : {}),
          },
        };
      },
      transformResponse: (raw: ReferralListPaginatedResponse) => ({
        data: Array.isArray(raw.data) ? raw.data : [],
        page: Number(raw.page ?? 1),
        page_size: Number(raw.page_size ?? raw.limit ?? 10),
        total: Number(raw.total ?? 0),
      }),
      providesTags: ["Referral"],
    }),
    getReferralById: builder.query<Referral, string>({
      query: (id) => `${LIAISON_ROUTES.GET_BY_ID(id)}`,
      providesTags: (result, error, id) => [{ type: "Referral", id }],
    }),
    forwardReferral: builder.mutation<
      Referral,
      { id: string; target_dept_id?: string; [key: string]: any }
    >({
      query: ({ id, ...body }) => ({
        url: LIAISON_ROUTES.FORWARD(id),
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Referral", id },
        "Referral",
      ],
    }),
    readReferral: builder.mutation<Referral, string>({
      query: (id) => ({
        url: LIAISON_ROUTES.READ(id),
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Referral", id },
        "Referral",
      ],
    }),
    rejectReferral: builder.mutation<
      Referral,
      { id: string; reason?: string; [key: string]: any }
    >({
      query: ({ id, ...body }) => ({
        url: LIAISON_ROUTES.REJECT(id),
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Referral", id },
        "Referral",
      ],
    }),
    reviseReferral: builder.mutation<
      Referral,
      { id: string; reason?: string; [key: string]: any }
    >({
      query: ({ id, ...body }) => ({
        url: LIAISON_ROUTES.REVISE(id),
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Referral", id },
        "Referral",
      ],
    }),
    getLiaisonDashboardStats: builder.query<LiaisonDashboardStats, void>({
      query: () => ({
        url: LIAISON_ROUTES.DASHBOARD_STATS,
        method: "GET",
      }),
      transformResponse: (
        response: LiaisonDashboardStatsResponse | LiaisonDashboardStats,
      ): LiaisonDashboardStats => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return response as LiaisonDashboardStats;
      },
      providesTags: [{ type: "LiaisonDashboardStats", id: "STATS" }],
    }),
    getReviewChecklist: builder.query<LiaisonReviewChecklist, string>({
      query: (id) => ({
        url: LIAISON_ROUTES.REVIEW_CHECKLIST(id),
        method: "GET",
      }),
      transformResponse: (
        response:
          | LiaisonReviewChecklist
          | { data: LiaisonReviewChecklist }
          | undefined,
      ): LiaisonReviewChecklist => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return (response as LiaisonReviewChecklist) ?? {
          attachments_included: false,
          clinical_history_attached: false,
          patient_identity_verified: false,
          vitals_included: false,
        };
      },
      providesTags: (_result, _err, id) => [{ type: "ReviewChecklist", id }],
    }),
    updateReviewChecklist: builder.mutation<
      LiaisonReviewChecklist,
      { id: string; body: LiaisonReviewChecklist }
    >({
      query: ({ id, body }) => ({
        url: LIAISON_ROUTES.REVIEW_CHECKLIST(id),
        method: "PUT",
        body,
      }),
      transformResponse: (
        response:
          | LiaisonReviewChecklist
          | { data: LiaisonReviewChecklist }
          | undefined,
        _meta,
        arg,
      ): LiaisonReviewChecklist => {
        if (response && typeof response === "object" && "data" in response) {
          return response.data;
        }
        return (response as LiaisonReviewChecklist) ?? arg.body;
      },
      invalidatesTags: (_result, _err, arg) => [
        { type: "ReviewChecklist", id: arg.id },
      ],
    }),
  }),
});

export const {
  useGetReferralsQuery,
  useGetReferralByIdQuery,
  useForwardReferralMutation,
  useReadReferralMutation,
  useRejectReferralMutation,
  useReviseReferralMutation,
  useGetLiaisonDashboardStatsQuery,
  useGetReviewChecklistQuery,
  useUpdateReviewChecklistMutation,
} = liaisonApi;
