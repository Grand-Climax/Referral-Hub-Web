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
  TriagePatient,
  TriageQueueResponse,
  PriorityBuckets,
  DashboardStats,
  TrendEntry,
  CalendarDayEntry,
  CapacityDetail,
  StaffSummary,
  ScheduledPatient,
  ActivityEntry,
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
    "Staff",
    "Activity",
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

    getTriageQueue: builder.query<
      { data: TriagePatient[]; total: number },
      { page?: number; page_size?: number } | void
    >({
      query: (params) => ({
        url: DEPARTMENT_HEAD_ROUTES.TRIAGE_QUEUE,
        params: params || { page: 1, page_size: 20 },
      }),
      transformResponse: (raw: TriageQueueResponse | TriagePatient[]) => {
        if (Array.isArray(raw)) return { data: raw, total: raw.length };
        if (raw && "data" in raw)
          return { data: raw.data ?? [], total: raw.total ?? 0 };
        return { data: [], total: 0 };
      },
      providesTags: ["TriageQueue"],
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

    // ─── Staff ────────────────────────────────────────────────────────────────

    getStaffSummary: builder.query<StaffSummary, void>({
      query: () => DEPARTMENT_HEAD_ROUTES.STAFF_SUMMARY,
      transformResponse: (raw: unknown) =>
        unwrapData<StaffSummary>(raw, {} as StaffSummary),
      providesTags: ["Staff"],
    }),

    updateStaffCapacity: builder.mutation<ApiSuccessResponse, { value: number }>({
      query: (body) => ({
        url: DEPARTMENT_HEAD_ROUTES.UPDATE_STAFF_CAPACITY,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Staff", "DashboardStats"],
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

    // ─── Activity ─────────────────────────────────────────────────────────────

    getActivity: builder.query<
      { data: ActivityEntry[]; total: number },
      { limit?: number; start_date?: string; end_date?: string } | void
    >({
      query: (params) => ({
        url: DEPARTMENT_HEAD_ROUTES.ACTIVITY,
        params: params || { limit: 20 },
      }),
      transformResponse: (raw: unknown) => {
        if (Array.isArray(raw)) return { data: raw as ActivityEntry[], total: raw.length };
        const r = raw as Record<string, unknown>;
        if (r.data && Array.isArray(r.data))
          return { data: r.data as ActivityEntry[], total: (r.total as number) ?? r.data.length };
        return { data: [], total: 0 };
      },
      providesTags: ["Activity"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetDashboardTrendsQuery,
  useGetTriageQueueQuery,
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
  useGetStaffSummaryQuery,
  useUpdateStaffCapacityMutation,
  useGetActivityQuery,
  useGetDailyCapacityQuery,
  useUpdateDailyCapacityMutation,
} = departmentHeadApi;
