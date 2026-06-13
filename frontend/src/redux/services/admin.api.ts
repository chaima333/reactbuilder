import { api } from "../api/api";

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPendingUsers: builder.query<any, void>({
      query: () => "/admin/pending-users",
      transformResponse: (res: any) => res.data,
      providesTags: ["PendingUsers"],
    }),

    approveUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/approve-user/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["PendingUsers", "Users", "User"],
    }),

    rejectUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/reject-user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PendingUsers", "Users"],
    }),

    getAdminStats: builder.query<any, void>({
      query: () => "/admin/stats",
      transformResponse: (res: any) => res.data,
      providesTags: ["AdminStats"],
    }),

    getAdminUsers: builder.query<any, void>({
      query: () => "/admin/users",
      transformResponse: (res: any) => res.data,
      providesTags: ["Users"],
    }),

    getAdminSites: builder.query<any, void>({
      query: () => "/admin/sites",
      transformResponse: (res: any) => res.data,
      providesTags: ["Sites"],
    }),

    getAdminPlugins: builder.query<any, void>({
      query: () => "/admin/plugins",
      transformResponse: (res: any) => res.data,
      providesTags: ["Plugins"],
    }),

    getAdminActivityLogs: builder.query<any, void>({
      query: () => "/admin/activity-logs",
      transformResponse: (res: any) => res.data,
      providesTags: ["ActivityLogs"],
    }),
  }),
});

export const {
  useGetPendingUsersQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminSitesQuery,
  useGetAdminPluginsQuery,
  useGetAdminActivityLogsQuery,
} = adminApi;