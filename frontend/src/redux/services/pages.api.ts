import { api } from '../api/api';

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPages: builder.query<any, number>({
      query: (siteId) => `/sites/${siteId}/pages`,
      providesTags: ['Pages'],
    }),

    getPageById: builder.query<any, { siteId: number; pageId: number }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}`,
      providesTags: ['Pages'],
    }),

    createPage: builder.mutation<any, any>({
      query: ({ siteId, ...data }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),

    updatePage: builder.mutation<any, any>({
      query: ({ siteId, pageId, ...data }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),

    deletePage: builder.mutation<any, { siteId: number; pageId: number }>({
      query: ({ siteId, pageId }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pages', 'Sites'],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pagesApi;