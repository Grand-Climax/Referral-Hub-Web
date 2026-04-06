import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { REFERENCE_ROUTES } from "@/config/api";
import type { ICDCode } from "@/types/icd";

export const icdApi = createApi({
  reducerPath: "icdApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ICD"],
  endpoints: (builder) => ({
    getIcdCodes: builder.query<ICDCode[], void>({
      query: () => ({
        url: REFERENCE_ROUTES.ICD10_CODES,
        method: "GET",
      }),
      transformResponse: (response: { data: ICDCode[] }) => {
        return response.data || [];
      },
    }),
  }),
});

export const { useGetIcdCodesQuery } = icdApi;

