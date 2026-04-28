import { api } from '../api/api';


type DashboardStats = {
  totalUsers: number;
  totalSites: number;
  totalPages: number;
};

type Activity = {
  id: number;
  action: string;
  createdAt: string;
};

type SiteStats = {
  views: number;
  pages: number;
};

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),

    getActivityLog: builder.query<Activity[], { limit?: number }>({
      query: ({ limit = 50 } = {}) => ({
        url: '/dashboard/activity',
        params: { limit },
      }),
      providesTags: ['Activity'],
    }),

    getSiteStats: builder.query<SiteStats, number>({
      query: (siteId) => `/dashboard/sites/${siteId}/stats`,
      providesTags: ['Stats'],
    }),

  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetActivityLogQuery,
  useGetSiteStatsQuery,
} = dashboardApi;