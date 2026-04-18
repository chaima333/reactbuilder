import { api } from '../api/api';

export const mediaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMedia: builder.query<any, void>({
      query: () => '/media',
      providesTags: ['Media'],
    }),

    uploadMedia: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/media/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media'],
    }),

    deleteMedia: builder.mutation<any, number>({
      query: (id) => ({
        url: `/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Media'],
    }),

    updateMediaAlt: builder.mutation<any, { id: number; alt: string }>({
      query: ({ id, alt }) => ({
        url: `/media/${id}/alt`,
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