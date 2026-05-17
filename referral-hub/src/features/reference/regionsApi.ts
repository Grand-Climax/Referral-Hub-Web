import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { REFERENCE_ROUTES } from "@/config/api";

type RegionEntry =
  | string
  | {
      name?: string;
      region?: string;
      label?: string;
      code?: string;
      id?: string;
    };

type RegionsRawResponse =
  | RegionEntry[]
  | {
      data?: RegionEntry[];
      regions?: RegionEntry[];
    };

function normalizeRegions(raw: RegionsRawResponse | unknown): string[] {
  const candidate = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
      ? ((raw as { data?: RegionEntry[]; regions?: RegionEntry[] }).data ??
        (raw as { regions?: RegionEntry[] }).regions ??
        [])
      : [];

  const names = (candidate as RegionEntry[])
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object") {
        return entry.name ?? entry.region ?? entry.label ?? entry.code ?? "";
      }
      return "";
    })
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return Array.from(new Set(names));
}

export const regionsApi = createApi({
  reducerPath: "regionsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Region"],
  endpoints: (builder) => ({
    getRegions: builder.query<string[], void>({
      query: () => ({
        url: REFERENCE_ROUTES.REGIONS,
        method: "GET",
      }),
      transformResponse: (response: RegionsRawResponse) =>
        normalizeRegions(response),
      providesTags: [{ type: "Region", id: "LIST" }],
    }),
  }),
});

export const { useGetRegionsQuery } = regionsApi;
