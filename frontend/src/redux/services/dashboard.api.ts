// src/redux/services/dashboard.api.ts
import { api } from "../api/api";
import { DashboardStats, ActivityItem, DashboardBlock } from "../../modules/dashboard/components/widgets/types";

export interface DashboardFullResponse {
  data: {
    stats: DashboardStats;
    activity: ActivityItem[];
    plugins: Record<string, any>;
    layout: {
      blocks: DashboardBlock[];
    };
  };
  message?: string;
  status?: string;
}


export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
   getDashboardFull: builder.query<any, number>({
  query: (siteId) => `/sites/${siteId}/dashboard/full`,
  transformResponse: (res: any) => res.data,
  providesTags: ["Stats", "Activity"],
}),
  }),
});

export const { useGetDashboardFullQuery } = dashboardApi;