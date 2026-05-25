import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { REFERENCE_ROUTES } from "@/config/api";
import type { ICDCode, ICDCategory, IcdCodeQuery } from "@/types/icd";

/**
 * Normalises the assorted category-response shapes the backend has shipped
 * over time:
 *   - `["Infectious diseases", "Neoplasms", ...]` (array of strings)
 *   - `[{ category: "Infectious diseases" }, ...]`
 *   - `[{ name: "Infectious diseases" }, ...]`
 * Anything we can't turn into a non-empty string is dropped so the
 * dropdown never gets blank rows.
 */
function toCategoryName(v: unknown): string {
  if (typeof v === "string") return v.trim();
  if (v && typeof v === "object") {
    const r = v as Record<string, unknown>;
    const name =
      (typeof r.name === "string" && r.name) ||
      (typeof r.category === "string" && r.category) ||
      (typeof r.value === "string" && r.value) ||
      "";
    return name.trim();
  }
  return "";
}

export const icdApi = createApi({
  reducerPath: "icdApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ICD", "ICDCategory"],
  endpoints: (builder) => ({
    /**
     * Paginated ICD-10 search. All four params are optional; omitting
     * everything returns the first page of the full catalogue. The
     * referral form's picker re-issues this query on every change to
     * search / category / page — RTK Query dedupes identical requests.
     */
    getIcdCodes: builder.query<ICDCode[], IcdCodeQuery | void>({
      query: (params) => {
        // Strip empty values so we don't litter the request with
        // `?search=&category=` — the backend treats absent and empty as
        // the same thing but clean URLs are nicer in the network tab.
        const cleanParams: Record<string, string | number> = {};
        if (params && typeof params === "object") {
          if (params.search) cleanParams.search = params.search;
          if (params.category) cleanParams.category = params.category;
          if (params.page) cleanParams.page = params.page;
          if (params.page_size) cleanParams.page_size = params.page_size;
        }
        return {
          url: REFERENCE_ROUTES.ICD10_CODES,
          method: "GET",
          params: cleanParams,
        };
      },
      transformResponse: (raw: unknown): ICDCode[] => {
        if (Array.isArray(raw)) return raw as ICDCode[];
        const wrapped = (raw as { data?: unknown })?.data;
        return Array.isArray(wrapped) ? (wrapped as ICDCode[]) : [];
      },
      providesTags: ["ICD"],
    }),
    /**
     * Returns the distinct list of ICD-10 categories the dataset is bucketed
     * by. Cached separately ("ICDCategory" tag) so a code search doesn't
     * trigger a re-fetch of the categories dropdown.
     */
    getIcdCategories: builder.query<ICDCategory[], void>({
      query: () => ({
        url: REFERENCE_ROUTES.ICD10_CATEGORIES,
        method: "GET",
      }),
      transformResponse: (raw: unknown): ICDCategory[] => {
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as { data?: unknown })?.data)
            ? ((raw as { data: unknown[] }).data)
            : [];
        const cleaned = list.map(toCategoryName).filter(Boolean);
        // De-dupe + sort alphabetically so the dropdown is predictable.
        return Array.from(new Set(cleaned)).sort((a, b) => a.localeCompare(b));
      },
      providesTags: ["ICDCategory"],
    }),
  }),
});

export const { useGetIcdCodesQuery, useGetIcdCategoriesQuery } = icdApi;
