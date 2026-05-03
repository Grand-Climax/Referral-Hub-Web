import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { DEPARTMENT_HEAD_ROUTES } from "@/config/api";
import {
  CapacityOverride,
  CapacityOverridesResponse,
  CreateCapacityOverrideRequest,
  UpdateCapacityOverrideRequest,
  DailySchedule,
  ScheduleResponse,
  UpdateMaxSlotsRequest,
  BatchSchedulingResponse,
  ApiSuccessResponse,
  TriagePatient,
  TriageQueueResponse,
} from "@/types/department-head";

/**
 * Department Head API
 * 
 * This API service handles all department head operations including:
 * - Capacity override management (CRUD operations)
 * - Schedule viewing and management
 * - Batch scheduling automation
 * 
 * All endpoints require DEPT_HEAD role authentication.
 */
export const departmentHeadApi = createApi({
  reducerPath: "departmentHeadApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["CapacityOverride", "Schedule"],
  endpoints: (builder) => ({
    // ─── Capacity Override Endpoints ────────────────────────────────────────

    /**
     * GET /api/v1/department-head/capacity/overrides
     * 
     * Fetches all active and upcoming capacity overrides for the department.
     * 
     * @returns List of capacity overrides
     */
    getCapacityOverrides: builder.query<CapacityOverride[], void>({
      query: () => DEPARTMENT_HEAD_ROUTES.LIST_CAPACITY_OVERRIDES,
      transformResponse: (response: CapacityOverridesResponse | any) => {
        // Handle different response formats from backend
        if (Array.isArray(response)) {
          return response;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // If response is an object with keys, convert to array
        if (typeof response === "object" && !response.data) {
          return Object.values(response);
        }
        return [];
      },
      providesTags: ["CapacityOverride"],
    }),

    /**
     * POST /api/v1/department-head/capacity/overrides
     * 
     * Creates a new capacity override for a specific date.
     * Side Effect: Automatically synchronizes the daily schedule for that date.
     * 
     * @param data - Override details (target_date, new_limit, reason)
     * @returns Success message
     * 
     * Common Errors:
     * - 400: Date in past
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
    createCapacityOverride: builder.mutation<
      ApiSuccessResponse,
      CreateCapacityOverrideRequest
    >({
      query: (data) => ({
        url: DEPARTMENT_HEAD_ROUTES.CREATE_CAPACITY_OVERRIDE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CapacityOverride", "Schedule"],
    }),

    /**
     * PUT /api/v1/department-head/capacity/overrides/{id}
     * 
     * Updates an existing capacity override's limit and reason.
     * 
     * @param id - Override ID
     * @param data - Update details (new_limit, reason)
     * @returns Success message
     * 
     * Common Errors:
     * - 400: Invalid ID or input
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
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

    /**
     * DELETE /api/v1/department-head/capacity/overrides/{id}
     * 
     * Removes a capacity override, reverting the daily schedule to standard limits.
     * 
     * @param id - Override ID
     * @returns Success message
     * 
     * Common Errors:
     * - 400: Invalid ID
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
    deleteCapacityOverride: builder.mutation<ApiSuccessResponse, string>({
      query: (id) => ({
        url: DEPARTMENT_HEAD_ROUTES.DELETE_CAPACITY_OVERRIDE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["CapacityOverride", "Schedule"],
    }),

    // ─── Schedule Endpoints ─────────────────────────────────────────────────

    /**
     * GET /api/v1/department-head/schedule
     * 
     * Returns daily schedule records for the department.
     * Default: Next 30 days if no date range provided.
     * 
     * @param start_date - Start date (YYYY-MM-DD) - optional
     * @param end_date - End date (YYYY-MM-DD) - optional
     * @returns List of daily schedules
     * 
     * Common Errors:
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
    getSchedule: builder.query<
      DailySchedule[],
      { start_date?: string; end_date?: string } | void
    >({
      query: (params) => ({
        url: DEPARTMENT_HEAD_ROUTES.VIEW_SCHEDULE,
        params: params || {},
      }),
      transformResponse: (response: ScheduleResponse | any) => {
        // Handle different response formats from backend
        if (Array.isArray(response)) {
          return response;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // If response is an object with keys, convert to array
        if (typeof response === "object" && !response.data) {
          return Object.values(response);
        }
        return [];
      },
      providesTags: ["Schedule"],
    }),

    /**
     * POST /api/v1/department-head/schedule/batch
     * 
     * Triggers the automated batch scheduling process for all WAITING referrals
     * in priority order.
     * 
     * Prerequisites: Reads all WAITING entries for the department.
     * State Transition: Assigns appointment dates to referrals and creates status history records.
     * Gatekeepers: Respects buffer days and never overbooks.
     * 
     * @returns Scheduling result with count of scheduled referrals
     * 
     * Common Errors:
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
    runBatchScheduling: builder.mutation<BatchSchedulingResponse, void>({
      query: () => ({
        url: DEPARTMENT_HEAD_ROUTES.RUN_BATCH_SCHEDULING,
        method: "POST",
      }),
      invalidatesTags: ["Schedule"],
    }),

    /**
     * PUT /api/v1/department-head/schedule/{id}/max-slots
     * 
     * Manually adjusts the maximum slots for a specific day.
     * 
     * @param id - Schedule ID
     * @param max_slots - New maximum slots value (must be >= 1)
     * @returns Success message
     * 
     * Common Errors:
     * - 400: Invalid schedule ID or input
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
    updateMaxSlots: builder.mutation<
      ApiSuccessResponse,
      { id: string } & UpdateMaxSlotsRequest
    >({
      query: ({ id, ...data }) => ({
        url: DEPARTMENT_HEAD_ROUTES.UPDATE_MAX_SLOTS(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Schedule"],
    }),

    // ─── Triage Queue Endpoint ──────────────────────────────────────────────

    /**
     * GET /api/v1/triage
     * 
     * Returns a prioritized list of patients waiting for triage.
     * Sorting: Severity score descending, waiting time ascending.
     * 
     * @param limit - Pagination limit (default: 10)
     * @param offset - Pagination offset (default: 0)
     * @returns List of triage patients
     * 
     * Common Errors:
     * - 401: Unauthorized
     * - 500: Internal Server Error
     */
    getTriageQueue: builder.query<
      TriagePatient[],
      { limit?: number; offset?: number } | void
    >({
      query: (params) => ({
        url: DEPARTMENT_HEAD_ROUTES.TRIAGE_QUEUE,
        params: params || { limit: 10, offset: 0 },
      }),
      transformResponse: (response: TriageQueueResponse | any) => {
        // Handle different response formats from backend
        if (Array.isArray(response)) {
          return response;
        }
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        // If response is an object with keys, convert to array
        if (typeof response === "object" && !response.data) {
          return Object.values(response);
        }
        return [];
      },
      providesTags: ["Schedule"], // Using Schedule tag since it's related to patient flow
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Capacity Override hooks
  useGetCapacityOverridesQuery,
  useCreateCapacityOverrideMutation,
  useUpdateCapacityOverrideMutation,
  useDeleteCapacityOverrideMutation,

  // Schedule hooks
  useGetScheduleQuery,
  useRunBatchSchedulingMutation,
  useUpdateMaxSlotsMutation,
  
  // Triage Queue hook
  useGetTriageQueueQuery,
} = departmentHeadApi;
