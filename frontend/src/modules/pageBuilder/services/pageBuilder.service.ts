import { api } from "../../../redux/api/api";

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    
    getPageVersions: builder.query({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}/versions`,
      providesTags: ['Pages'], 
    }),

    restorePageVersion: builder.mutation({
      query: ({ siteId, pageId, versionId }) => ({
        url: `/sites/${siteId}/pages/${pageId}/restore/${versionId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Pages'], 
    }),

    updatePage: builder.mutation({
      query: ({ siteId, pageId, ...payload }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Pages'],
    }),

  }),
});

export const { 
  useGetPageVersionsQuery, 
  useRestorePageVersionMutation,
  useUpdatePageMutation 
} = pagesApi