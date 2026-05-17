import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/baseQuery";
import { HOSPITAL_ROUTES, SYSTEM_ADMIN_ROUTES } from "@/config/api";
import type { CreateHospitalRequest, Hospital } from "@/types/hospital";
import type {
  AssignSystemAdminRoleRequest,
  CreateSystemAdminUserRequest,
  SystemAdminUser,
  SystemAdminUsersPage,
  SystemAdminUsersQueryParams,
  SystemAdminUsersResponse,
  UpdateSystemAdminUserRequest,
} from "@/types/system-admin";
import { normalizeSystemAdminUsersPage } from "@/types/system-admin";

export const systemAdminApi = createApi({
  reducerPath: "systemAdminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SystemAdminUser"],
  endpoints: (builder) => ({
    getSystemAdminUsers: builder.query<
      SystemAdminUsersPage,
      SystemAdminUsersQueryParams | void
    >({
      query: (queryParams) => {
        const params: Record<string, string | number | boolean> = {};
        if (queryParams) {
          for (const [key, value] of Object.entries(queryParams)) {
            if (value === undefined || value === null || value === "") continue;
            params[key] = value as string | number | boolean;
          }
        }
        return {
          url: SYSTEM_ADMIN_ROUTES.USERS,
          method: "GET",
          params: Object.keys(params).length > 0 ? params : undefined,
        };
      },
      transformResponse: (
        response: SystemAdminUsersResponse | SystemAdminUser[] | unknown,
      ) => normalizeSystemAdminUsersPage(response),
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({
                type: "SystemAdminUser" as const,
                id,
              })),
              { type: "SystemAdminUser" as const, id: "LIST" },
            ]
          : [{ type: "SystemAdminUser" as const, id: "LIST" }],
    }),
    createSystemAdminUser: builder.mutation<
      SystemAdminUser,
      CreateSystemAdminUserRequest
    >({
      query: (body) => ({
        url: SYSTEM_ADMIN_ROUTES.USERS,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SystemAdminUser", id: "LIST" }],
    }),
    createHospital: builder.mutation<Hospital, CreateHospitalRequest>({
      query: (body) => ({
        url: HOSPITAL_ROUTES.CREATE,
        method: "POST",
        body,
      }),
    }),
    updateSystemAdminUser: builder.mutation<
      SystemAdminUser,
      { id: string; body: UpdateSystemAdminUserRequest }
    >({
      query: ({ id, body }) => ({
        url: SYSTEM_ADMIN_ROUTES.USER_BY_ID(id),
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "SystemAdminUser", id: arg.id },
        { type: "SystemAdminUser", id: "LIST" },
      ],
    }),
    deleteSystemAdminUser: builder.mutation<void, string>({
      query: (id) => ({
        url: SYSTEM_ADMIN_ROUTES.USER_BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "SystemAdminUser", id },
        { type: "SystemAdminUser", id: "LIST" },
      ],
    }),
    moderateSystemAdminProfileImage: builder.mutation<void, string>({
      query: (id) => ({
        url: SYSTEM_ADMIN_ROUTES.USER_PROFILE_IMAGE(id),
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "SystemAdminUser", id },
        { type: "SystemAdminUser", id: "LIST" },
      ],
    }),
    assignSystemAdminRole: builder.mutation<
      SystemAdminUser,
      { id: string; body: AssignSystemAdminRoleRequest }
    >({
      query: ({ id, body }) => ({
        url: SYSTEM_ADMIN_ROUTES.USER_ROLE(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_, __, arg) => [
        { type: "SystemAdminUser", id: arg.id },
        { type: "SystemAdminUser", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetSystemAdminUsersQuery,
  useCreateSystemAdminUserMutation,
  useCreateHospitalMutation,
  useUpdateSystemAdminUserMutation,
  useDeleteSystemAdminUserMutation,
  useModerateSystemAdminProfileImageMutation,
  useAssignSystemAdminRoleMutation,
} = systemAdminApi;
