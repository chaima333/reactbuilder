import { api } from '../api/api';

export const mediaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMedia: builder.query<any, { siteId: string | number }>({
      query: ({ siteId }) => `/sites/${siteId}/media`,
      providesTags: ['Media'],
    }),

    uploadMedia: builder.mutation<any, { siteId: string | number; formData: FormData }>({
      query: ({ siteId, formData }) => ({
        url: `/sites/${siteId}/media/upload`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),

    deleteMedia: builder.mutation<any, { siteId: string | number; id: number | string }>({
      query: ({ siteId, id }) => ({
        url: `/sites/${siteId}/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Media'],
    }),

    updateMediaAlt: builder.mutation<any, { siteId: string | number; id: number | string; alt: string }>({
      query: ({ siteId, id, alt }) => ({
        url: `/sites/${siteId}/media/${id}/alt`,
        method: 'PUT',
        body: { alt },
      }),
      invalidatesTags: ['Media'],
    }),
  }),
});

export const {
  useGetMediaQuery,
  useUploadMediaMutation,
  useDeleteMediaMutation,
  useUpdateMediaAltMutation,
} = mediaApi;