import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { ADMIN_CONFIG_ROUTES } from "@/config/api";
import {
  normalizeSystemConfig,
  type SystemConfig,
  type SystemConfigResponse,
} from "@/types/system-config";

export const adminConfigApi = createApi({
  reducerPath: "adminConfigApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SystemConfig"],
  endpoints: (builder) => ({
    getSystemConfig: builder.query<SystemConfig, void>({
      query: () => ({
        url: ADMIN_CONFIG_ROUTES.CONFIG,
        method: "GET",
      }),
      transformResponse: (raw: SystemConfigResponse | SystemConfig) =>
        normalizeSystemConfig(raw),
      providesTags: [{ type: "SystemConfig", id: "CONFIG" }],
    }),
    updateSystemConfig: builder.mutation<SystemConfig, SystemConfig>({
      query: (body) => ({
        url: ADMIN_CONFIG_ROUTES.CONFIG,
        method: "PUT",
        body,
      }),
      transformResponse: (raw: SystemConfigResponse | SystemConfig) =>
        normalizeSystemConfig(raw),
      invalidatesTags: [{ type: "SystemConfig", id: "CONFIG" }],
    }),
  }),
});

export const {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} = adminConfigApi;
