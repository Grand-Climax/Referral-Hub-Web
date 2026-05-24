import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { DEPARTMENT_HEAD_ROUTES } from "@/config/api";
import type {
  CapacityOverride,
  CreateCapacityOverrideRequest,
  UpdateCapacityOverrideRequest,
  DailySchedule,
  BatchSchedulingResponse,
  ApiSuccessResponse,
  TriageListItem,
  TriageListEnvelope,
  TriageQueueFilters,
  TriageDetailDeptHead,
  PriorityBuckets,
  DashboardStats,
  TrendEntry,
  CalendarDayEntry,
  CapacityDetail,
  ScheduledPatient,
  DailyCapacityBaseline,
  UpdateDailyCapacityBaselineRequest,
} from "@/types/department-head";

function unwrapArray<T>(response: unknown): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];
  const r = response as Record<string, unknown>;
  if (r.data && Array.isArray(r.data)) return r.data as T[];
  if (typeof r === "object") return Object.values(r) as T[];
  return [];
}

function unwrapData<T>(response: unknown, fallback: T): T {
  if (!response) return fallback;
  const r = response as Record<string, unknown>;
  if (r.data !== undefined && r.data !== null) return r.data as T;
  return response as T;
}

export const departmentHeadApi = createApi({
  reducerPath: "departmentHeadApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "DashboardStats",
    "CapacityOverride",
    "Schedule",
    "TriageQueue",
    "DailyCapacityBaseline",
  ],
  endpoints: (builder) => ({
    // ─── Dashboard ────────────────────────────────────────────────────────────

    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => DEPARTMENT_HEAD_ROUTES.DASHBOARD_STATS,
      transformResponse: (raw: unknown) =>
        unwrapData<DashboardStats>(raw, {} as DashboardStats),
      providesTags: ["DashboardStats"],
    }),

    getDashboardTrends: builder.query<TrendEntry[], number>({
      query: (days = 14) => ({
        url: DEPARTMENT_HEAD_ROUTES.DASHBOARD_TRENDS,
        params: { days },
      }),
      transformResponse: (raw: unknown) => unwrapArray<TrendEntry>(raw),
    }),

    // ─── Triage Queue ─────────────────────────────────────────────────────────

    /**
     * Department-head triage list (§3 of the guide).
     *
     * Builds the query string carefully because the backend expects csv
     * for list params (`arrival_status=EXPECTED,MISSED`) — RTK-Query's
     * default `params` object would repeat the key instead. We pre-build
     * the URL with `URLSearchParams` to stay on-spec.
     *
     * Forward-compat: per the guide the server silently drops unknown
     * enums and clamps numeric overrides, so we don't need client-side
     * validation here beyond what the FE itself enforces.
     */
    getTriageQueue: builder.query<TriageListEnvelope, TriageQueueFilters | void>({
      query: (filters) => {
        const f = filters ?? {};
        const sp = new URLSearchParams();
        sp.set("page", String(f.page ?? 1));
        sp.set("limit", String(f.limit ?? 20));
        if (f.department_id) sp.set("department_id", f.department_id);
        if (f.arrival_status?.length)
          sp.set("arrival_status", f.arrival_status.join(","));
        if (f.referral_status?.length)
          sp.set("referral_status", f.referral_status.join(","));
        if (typeof f.has_doctor_assigned === "boolean")
          sp.set("has_doctor_assigned", String(f.has_doctor_assigned));
        if (f.patient_id) sp.set("patient_id", f.patient_id);
        if (f.national_id) sp.set("national_id", f.national_id);
        if (f.sort_by) sp.set("sort_by", f.sort_by);
        if (f.sort_order) sp.set("sort_order", f.sort_order);
        if (f.include_terminal) sp.set("include_terminal", "true");
        return `${DEPARTMENT_HEAD_ROUTES.TRIAGE_QUEUE}?${sp.toString()}`;
      },
      transformResponse: (raw: unknown): TriageListEnvelope => {
        // Be tolerant: handle both `{ success, data, ... }` envelope and a
        // raw array (older backend builds, or 304-style cached responses).
        if (Array.isArray(raw)) {
          return {
            success: true,
            data: raw as TriageListItem[],
            total: raw.length,
            page: 1,
            limit: raw.length,
            has_more: false,
          };
        }
        const r = (raw ?? {}) as Partial<TriageListEnvelope> & {
          data?: TriageListItem[];
        };
        return {
          success: r.success ?? true,
          data: r.data ?? [],
          total: r.total ?? r.data?.length ?? 0,
          page: r.page ?? 1,
          limit: r.limit ?? 20,
          has_more: r.has_more ?? false,
        };
      },
      providesTags: ["TriageQueue"],
    }),

    /**
     * Dept-head triage detail (§5.3). `referralId` MUST be the referral_id
     * (the field the server returns as `referral_id` on each list row),
     * never the `queue_id` — see the migration checklist at the top of the
     * guide. Returns `null` on 404 so the UI can render a friendly empty
     * state instead of a generic error card.
     */
    getTriageDetail: builder.query<TriageDetailDeptHead | null, string>({
      query: (referralId) => DEPARTMENT_HEAD_ROUTES.TRIAGE_DETAIL(referralId),
      transformResponse: (raw: unknown): TriageDetailDeptHead | null => {
        if (!raw) return null;
        const r = raw as Record<string, unknown>;
        if (r.data && typeof r.data === "object") {
          return r.data as TriageDetailDeptHead;
        }
        return raw as TriageDetailDeptHead;
      },
      providesTags: (_r, _e, referralId) => [
        { type: "TriageQueue", id: referralId },
      ],
    }),

    getPriorityBuckets: builder.query<PriorityBuckets, void>({
      query: () => DEPARTMENT_HEAD_ROUTES.TRIAGE_BUCKETS,
      transformResponse: (raw: unknown) =>
        unwrapData<PriorityBuckets>(raw, {} as PriorityBuckets),
      providesTags: ["TriageQueue"],
    }),

    // ─── Capacity Calendar ────────────────────────────────────────────────────

    getCapacityCalendar: builder.query<
      CalendarDayEntry[],
      { year: number; month: number }
    >({
      query: ({ year, month }) => ({
        url: DEPARTMENT_HEAD_ROUTES.CAPACITY_CALENDAR,
        params: { year, month },
      }),
      transformResponse: (raw: unknown) => unwrapArray<CalendarDayEntry>(raw),
      providesTags: ["Schedule"],
    }),

    getCapacityDetail: builder.query<CapacityDetail, string>({
      query: (date) => ({
        url: DEPARTMENT_HEAD_ROUTES.CAPACITY_DETAIL,
        params: { date },
      }),
      transformResponse: (raw: unknown) =>
        unwrapData<CapacityDetail>(raw, {} as CapacityDetail),
      providesTags: ["Schedule"],
    }),

    // ─── Capacity Overrides ───────────────────────────────────────────────────

    getCapacityOverrides: builder.query<CapacityOverride[], void>({
      query: () => DEPARTMENT_HEAD_ROUTES.LIST_CAPACITY_OVERRIDES,
      transformResponse: (raw: unknown) => unwrapArray<CapacityOverride>(raw),
      providesTags: ["CapacityOverride"],
    }),

    getOverridesByMonth: builder.query<
      CapacityOverride[],
      { year: number; month?: number }
    >({
      query: ({ year, month }) => ({
        url: DEPARTMENT_HEAD_ROUTES.OVERRIDES_BY_MONTH,
        params: { year, ...(month !== undefined ? { month } : {}) },
      }),
      transformResponse: (raw: unknown) => unwrapArray<CapacityOverride>(raw),
      providesTags: ["CapacityOverride"],
    }),

    getOverrideById: builder.query<CapacityOverride, string>({
      query: (id) => DEPARTMENT_HEAD_ROUTES.OVERRIDE_BY_ID(id),
      transformResponse: (raw: unknown) =>
        unwrapData<CapacityOverride>(raw, {} as CapacityOverride),
      providesTags: (_r, _e, id) => [{ type: "CapacityOverride", id }],
    }),

    createCapacityOverride: builder.mutation<
      ApiSuccessResponse,
      CreateCapacityOverrideRequest
    >({
      query: (data) => ({
        url: DEPARTMENT_HEAD_ROUTES.CREATE_CAPACITY_OVERRIDE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CapacityOverride", "Schedule", "DashboardStats"],
    }),

    updateCapacityOverride: builder.mutation<
      ApiSuccessResponse,
      { id: string } & UpdateCapacityOverrideRequest
    >({
      query: ({ id, ...data }) => ({
        url: DEPARTMENT_HEAD_ROUTES.UPDATE_CAPACITY_OVERRIDE(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CapacityOverride", "Schedule"],
    }),

    deleteCapacityOverride: builder.mutation<ApiSuccessResponse, string>({
      query: (id) => ({
        url: DEPARTMENT_HEAD_ROUTES.DELETE_CAPACITY_OVERRIDE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["CapacityOverride", "Schedule", "DashboardStats"],
    }),

    // ─── Schedule ─────────────────────────────────────────────────────────────

    getSchedule: builder.query<
      DailySchedule | DailySchedule[] | null,
      { date?: string; start_date?: string; end_date?: string } | void
    >({
      query: (params) => ({
        url: DEPARTMENT_HEAD_ROUTES.VIEW_SCHEDULE,
        params: params || {},
      }),
      transformResponse: (raw: unknown): DailySchedule | DailySchedule[] | null => {
        if (!raw) return null;
        const r = raw as Record<string, unknown>;
        if (Array.isArray(r.data)) return r.data as DailySchedule[];
        if (r.data === null) return null;
        if (r.data && typeof r.data === "object") return r.data as DailySchedule;
        if (Array.isArray(raw)) return raw as DailySchedule[];
        return null;
      },
      providesTags: ["Schedule"],
    }),

    getSchedulePatients: builder.query<ScheduledPatient[], string>({
      query: (date) => ({
        url: DEPARTMENT_HEAD_ROUTES.SCHEDULE_PATIENTS,
        params: { date },
      }),
      transformResponse: (raw: unknown) => unwrapArray<ScheduledPatient>(raw),
      providesTags: ["Schedule"],
    }),

    runBatchScheduling: builder.mutation<
      BatchSchedulingResponse,
      { send_notifications?: boolean } | void
    >({
      query: (body) => ({
        url: DEPARTMENT_HEAD_ROUTES.RUN_BATCH_SCHEDULING,
        method: "POST",
        body: body || { send_notifications: true },
      }),
      transformResponse: (raw: unknown): BatchSchedulingResponse => {
        const r = raw as Record<string, unknown>;
        if (r.data && typeof r.data === "object")
          return r.data as BatchSchedulingResponse;
        return r as BatchSchedulingResponse;
      },
      invalidatesTags: ["Schedule", "DashboardStats", "TriageQueue"],
    }),

    // ─── Daily Capacity Baseline ──────────────────────────────────────────────

    getDailyCapacity: builder.query<DailyCapacityBaseline, void>({
      query: () => DEPARTMENT_HEAD_ROUTES.DAILY_CAPACITY,
      transformResponse: (raw: unknown) =>
        unwrapData<DailyCapacityBaseline>(raw, {} as DailyCapacityBaseline),
      providesTags: [{ type: "DailyCapacityBaseline", id: "BASELINE" }],
    }),

    updateDailyCapacity: builder.mutation<
      DailyCapacityBaseline,
      UpdateDailyCapacityBaselineRequest
    >({
      query: (body) => ({
        url: DEPARTMENT_HEAD_ROUTES.DAILY_CAPACITY,
        method: "PUT",
        body,
      }),
      transformResponse: (raw: unknown) =>
        unwrapData<DailyCapacityBaseline>(raw, {} as DailyCapacityBaseline),
      // Optimistic update for instant feedback; rolls back on error.
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          departmentHeadApi.util.updateQueryData(
            "getDailyCapacity",
            undefined,
            (draft) => {
              draft.standard_daily_limit = body.standard_daily_limit;
              draft.overbook_limit = body.overbook_limit;
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [
        { type: "DailyCapacityBaseline", id: "BASELINE" },
        "Schedule",
        "DashboardStats",
      ],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardTrendsQuery,
  useGetTriageQueueQuery,
  useGetTriageDetailQuery,
  useGetPriorityBucketsQuery,
  useGetCapacityCalendarQuery,
  useGetCapacityDetailQuery,
  useGetCapacityOverridesQuery,
  useGetOverridesByMonthQuery,
  useGetOverrideByIdQuery,
  useCreateCapacityOverrideMutation,
  useUpdateCapacityOverrideMutation,
  useDeleteCapacityOverrideMutation,
  useGetScheduleQuery,
  useGetSchedulePatientsQuery,
  useRunBatchSchedulingMutation,
  useGetDailyCapacityQuery,
  useUpdateDailyCapacityMutation,
} = departmentHeadApi;
