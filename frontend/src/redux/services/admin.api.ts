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

   getAdminStats: builder.query<any, number>({
  query: (days) => `/admin/stats?days=${days}`,
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

    getAdminSettings: builder.query<any, void>({
  query: () => "/admin/settings",
  transformResponse: (res: any) => res.data,
  providesTags: ["AdminSettings"],
}),
updateAdminSettings: builder.mutation<any, any>({
  query: (body) => ({
    url: "/admin/settings",
    method: "PUT",
    body,
  }),
  invalidatesTags: ["AdminSettings", "PlatformSettings"],
}),
getAIStats: builder.query<any, number>({
  query: (days) => `/admin/ai-stats?days=${days}`,
  transformResponse: (res: any) => res.data,
  providesTags: ["AdminStats"],
}),

generateAdminApiKey: builder.mutation<any, void>({
  query: () => ({
    url: "/admin/settings/generate-api-key",
    method: "POST",
  }),
  invalidatesTags: ["AdminSettings", "PlatformSettings"],
}),
testWebhook: builder.mutation<any, { webhookUrl: string }>({
  query: (body) => ({
    url: "/admin/settings/test-webhook",
    method: "POST",
    body,
  }),
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
  useGetAdminSettingsQuery,
useUpdateAdminSettingsMutation,
useGetAIStatsQuery,
useGenerateAdminApiKeyMutation,
useTestWebhookMutation,
} = adminApi;
