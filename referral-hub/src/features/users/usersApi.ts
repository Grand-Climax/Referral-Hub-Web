import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/lib/baseQuery';
import { USER_ROUTES } from '@/config/api';
import type {
  UserProfile,
  UpdateMePayload,
  UpdatePasswordPayload,
} from '@/types/user';

function unwrapUserProfile(raw: unknown): UserProfile {
  if (raw && typeof raw === 'object' && 'data' in raw && (raw as { data: unknown }).data) {
    return (raw as { data: UserProfile }).data;
  }
  return raw as UserProfile;
}

function unwrapUsersList(raw: unknown): UserProfile[] {
  if (Array.isArray(raw)) return raw as UserProfile[];
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: UserProfile[] }).data;
  }
  return [];
}

export interface UpdateProfileImagePayload {
  file: Blob;
  filename?: string;
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'UserList', 'CurrentUser'],
  endpoints: (builder) => ({
    getUsers: builder.query<UserProfile[], void>({
      query: () => USER_ROUTES.LIST,
      transformResponse: (raw: unknown) => unwrapUsersList(raw),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'UserList' as const, id: 'LIST' },
            ]
          : [{ type: 'UserList', id: 'LIST' }],
    }),
    getMe: builder.query<UserProfile, void>({
      query: () => USER_ROUTES.ME,
      transformResponse: (raw: unknown) => unwrapUserProfile(raw),
      providesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
    getUserById: builder.query<UserProfile, string>({
      query: (id) => USER_ROUTES.BY_ID(id),
      transformResponse: (raw: unknown) => unwrapUserProfile(raw),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateProfileImage: builder.mutation<UserProfile, UpdateProfileImagePayload>({
      query: ({ file, filename }) => {
        const safeFilename = filename ?? 'profile.jpg';
        const body = new FormData();
        // Backend handler reads `c.FormFile("image")`.
        body.append('image', file, safeFilename);
        return {
          url: USER_ROUTES.PROFILE_IMAGE,
          method: 'PUT',
          body,
          formData: true,
        };
      },
      transformResponse: (raw: unknown) => unwrapUserProfile(raw),
      invalidatesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
    deleteProfileImage: builder.mutation<void, void>({
      query: () => ({
        url: USER_ROUTES.PROFILE_IMAGE,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
    updateMe: builder.mutation<UserProfile, UpdateMePayload>({
      query: (body) => ({
        url: USER_ROUTES.UPDATE_ME,
        method: 'PUT',
        body,
      }),
      transformResponse: (raw: unknown) => unwrapUserProfile(raw),
      invalidatesTags: [{ type: 'CurrentUser', id: 'ME' }],
    }),
    updatePassword: builder.mutation<{ message?: string }, UpdatePasswordPayload>({
      query: (body) => ({
        url: USER_ROUTES.UPDATE_PASSWORD,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetMeQuery,
  useGetUserByIdQuery,
  useUpdateProfileImageMutation,
  useDeleteProfileImageMutation,
  useUpdateMeMutation,
  useUpdatePasswordMutation,
} = usersApi;
