import { api } from '../api/api';

export const sitesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSites: builder.query<any, void>({
      query: () => '/sites',
      providesTags: ['Sites'],
    }),
    getSiteById: builder.query<any, number>({
      query: (id) => `/sites/${id}`,
      providesTags: ['Sites'],
    }),
    createSite: builder.mutation<any, any>({
      query: (data) => ({ url: '/sites', method: 'POST', body: data }),
      invalidatesTags: ['Sites', 'Stats'],
    }),
    updateSite: builder.mutation<any, { id: number; [key: string]: any }>({
      query: ({ id, ...data }) => ({ url: `/sites/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Sites', 'Stats'],
    }),
    deleteSite: builder.mutation<any, number>({
      query: (id) => ({ url: `/sites/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Sites', 'Stats'],
    }),
  }),
});

export const { 
  useGetSitesQuery, 
  useGetSiteByIdQuery, 
  useCreateSiteMutation, 
  useUpdateSiteMutation, 
  useDeleteSiteMutation 
} = sitesApi;