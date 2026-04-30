// src/redux/services/dashboard.api.ts
import { api } from '../api/api';

// 📊 تريف الـ Types باش الـ TypeScript ميعملش مشاكل
type DashboardStats = {
  totalSites: number;
  totalPages: number;
  totalViews: number;
  performance: {
    storageUsed: string;
    uptime: string;
  };
  chartData: Array<{ name: string; value: number }>; // للداتا متاع الـ MonthlyChart
};

type Activity = {
  id: number;
  action: string;
  user?: string;
  target?: string;
  createdAt: string;
};

// 💉 Inject Endpoints
export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    // جلب إحصائيات الـ Dashboard كاملة
    getDashboardStats: builder.query<{ data: DashboardStats }, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),

    // جلب سجل النشاطات (Recent Activity)
    getRecentActivity: builder.query<{ data: Activity[] }, { limit?: number } | void>({
      query: (params) => ({
        url: '/dashboard/activity',
        params: { limit: params?.limit ?? 10 },
      }),
      providesTags: ['Activity'],
    }),

    // جلب إحصائيات موقع معين
    getSiteStats: builder.query<{ data: any }, number>({
      query: (siteId) => `/dashboard/sites/${siteId}/stats`,
      providesTags: ['Stats'],
    }),

  }),
});

// 🔥 تصدير الـ Hooks بالأسامي اللي استعملناهم في الـ useDashboardData
export const {
  useGetDashboardStatsQuery,
  useGetRecentActivityQuery, // هذي بدلنا اسمها باش تتطابق مع الـ hook
  useGetSiteStatsQuery,
} = dashboardApi;