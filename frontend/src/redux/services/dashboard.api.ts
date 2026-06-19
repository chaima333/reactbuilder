import { api } from "../api/api";
import { DashboardFullResponse } from "../../modules/dashboard/types/dashboard.types";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
   getDashboardFull: builder.query<DashboardFullResponse, number>({
  query: (siteId) => `/sites/${siteId}/dashboard/full`,

  transformResponse: (res: any) => {
    console.log("📡 SERVER RAW RESPONSE:", res);
    return res.data;
  },

  providesTags: ["Dashboard"],
}),
  }),
});
export const { useGetDashboardFullQuery } = dashboardApi;