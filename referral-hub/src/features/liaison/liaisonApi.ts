import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { LIAISON_ROUTES } from "@/config/api";
import { Referral } from "@/types/referral";

import { ReferralListPaginatedResponse } from "@/types/referral-list";

export const liaisonApi = createApi({
  reducerPath: "liaisonApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Referral"],
  endpoints: (builder) => ({
    getReferrals: builder.query<
      ReferralListPaginatedResponse,
      {
        page?: number;
        limit?: number;
        page_size?: number;
        status?: string;
      } | void
    >({
      query: (params) => {
        const pageNum = params?.page ?? 1;
        const pageSize = params?.limit ?? params?.page_size ?? 10;

        return {
          url: LIAISON_ROUTES.LIST,
          params: {
            page: pageNum,
            limit: pageSize,
            ...(params?.status ? { status: params.status } : {}),
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
  }),
});

export const {
  useGetReferralsQuery,
  useGetReferralByIdQuery,
  useForwardReferralMutation,
  useReadReferralMutation,
  useRejectReferralMutation,
  useReviseReferralMutation,
} = liaisonApi;
