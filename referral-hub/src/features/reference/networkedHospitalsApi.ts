import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { REFERENCE_ROUTES } from "@/config/api";
import type { Hospital } from "@/types/hospital";

export const networkedHospitalsApi = createApi({
  reducerPath: "networkedHospitalsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["NetworkedHospital"],
  endpoints: (builder) => ({
    getNetworkedHospitals: builder.query<Hospital[], void>({
      query: () => ({
        url: REFERENCE_ROUTES.NETWORKED_HOSPITALS,
        method: "GET",
      }),
      transformResponse: (response: Hospital[] | { data: Hospital[] }) => {
        if (Array.isArray(response)) return response;
        return response.data || [];
      },
    }),
  }),
});

export const { useGetNetworkedHospitalsQuery } = networkedHospitalsApi;

