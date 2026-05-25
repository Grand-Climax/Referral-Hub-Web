import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { ADMIN_NETWORK_ROUTES } from "@/config/api";
import type {
  CreateNetworkRouteRequest,
  NetworkRoute,
  NetworkRoutesResponse,
} from "@/types/network-route";

export const networkRoutesApi = createApi({
  reducerPath: "networkRoutesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["NetworkRoute"],
  endpoints: (builder) => ({
    getNetworkRoutes: builder.query<
      NetworkRoute[],
      { sender_hospital_id?: string } | void
    >({
      query: (params) => ({
        url: ADMIN_NETWORK_ROUTES.LIST,
        method: "GET",
        params:
          params && params.sender_hospital_id
            ? { sender_hospital_id: params.sender_hospital_id }
            : undefined,
      }),
      transformResponse: (
        response: NetworkRoutesResponse | NetworkRoute[] | unknown,
      ): NetworkRoute[] => {
        if (Array.isArray(response)) return response;
        if (response && typeof response === "object") {
          const payload = response as NetworkRoutesResponse;
          if (Array.isArray(payload.data)) return payload.data;
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "NetworkRoute" as const,
                id,
              })),
              { type: "NetworkRoute" as const, id: "LIST" },
            ]
          : [{ type: "NetworkRoute" as const, id: "LIST" }],
    }),
    createNetworkRoute: builder.mutation<NetworkRoute, CreateNetworkRouteRequest>({
      query: (body) => ({
        url: ADMIN_NETWORK_ROUTES.CREATE,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "NetworkRoute", id: "LIST" }],
    }),
    deleteNetworkRoute: builder.mutation<void, string>({
      query: (id) => ({
        url: ADMIN_NETWORK_ROUTES.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "NetworkRoute", id },
        { type: "NetworkRoute", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetNetworkRoutesQuery,
  useCreateNetworkRouteMutation,
  useDeleteNetworkRouteMutation,
} = networkRoutesApi;
