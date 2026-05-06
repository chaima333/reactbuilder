// src/redux/services/dashboard.api.ts

import { api } from "../api/api";

import {
  DashboardFullResponse
} from "../../modules/dashboard/types/dashboard.types";

export const dashboardApi = api.injectEndpoints({

  endpoints: (builder) => ({

    getDashboardFull: builder.query<
      DashboardFullResponse,
      number
    >({

      query: (siteId) =>
        `/sites/${siteId}/dashboard/full`,

      // 🔥 نخليو data مباشرة
      transformResponse: (res: any) => res.data,

      providesTags: [
        "Stats",
        "Activity"
      ]
    })

  })

});

export const {
  useGetDashboardFullQuery
} = dashboardApi;