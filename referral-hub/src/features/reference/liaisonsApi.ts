import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { REFERENCE_ROUTES } from "@/config/api";
import type { LiaisonReference } from "@/types/liaison";

type LiaisonApiRecord = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export const liaisonsApi = createApi({
  reducerPath: "liaisonsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LiaisonReference"],
  endpoints: (builder) => ({
    getLiaisons: builder.query<LiaisonReference[], void>({
      query: () => ({
        url: REFERENCE_ROUTES.LIAISONS,
        method: "GET",
      }),
      transformResponse: (response: LiaisonApiRecord[] | { data: LiaisonApiRecord[] }) => {
        const raw = Array.isArray(response) ? response : response.data || [];
        return raw.filter((item) => Boolean(item.id));
      },
    }),
  }),
});

export const { useGetLiaisonsQuery } = liaisonsApi;

