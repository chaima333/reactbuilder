import { api } from "../api/api";
import { DashboardFullResponse } from "../../modules/dashboard/types/dashboard.types";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardFull: builder.query<DashboardFullResponse, number>({
      // 1. تأكد من الـ URL (جرب هذا)
query: (siteId) => `/sites/${siteId}/dashboard/full`,      
      // 2. فك التغليف مع Debugging
      transformResponse: (res: any) => {
        console.log("📡 SERVER RAW RESPONSE:", res); // شوف الكونسول باش تعرف شنوة بعث السيرفر
        return res.data; 
      },
    }),
  }),
});
export const { useGetDashboardFullQuery } = dashboardApi;