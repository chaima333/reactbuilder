import { api } from "../api/api";

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getAiHistory: builder.query<any, number>({
      query: (siteId) =>
        `/sites/${siteId}/ia/history`,
      providesTags: ["Dashboard"]
    })

  })
});

export const {
  useGetAiHistoryQuery
} = aiApi;