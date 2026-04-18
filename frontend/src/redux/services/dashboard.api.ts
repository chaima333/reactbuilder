import { api } from '../api/api';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<any, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),

    getActivityLog: builder.query<any, { limit?: number } | void>({
      query: (params) => `/dashboard/activity?limit=${params?.limit || 50}`,
      providesTags: ['Activity'],
    }),

    getSiteStats: builder.query<any, number>({
      query: (siteId) => `/dashboard/sites/${siteId}/stats`,
      providesTags: ['Sites'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetActivityLogQuery,
  useGetSiteStatsQuery,
} = dashboardApi;