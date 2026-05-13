import { api } from '../api/api';

import { Page }
from "./pages.api";

export type Site = {

  id: number;

  name: string;

  subdomain: string;

  title?: string;

  description?:
    string | null;

  status: string;

  createdAt: string;

  updatedAt: string;

  pages?: Page[];
};

export type SitesResponse = {
  success: boolean;
  data: Site[];
};

export const sitesApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getSites: builder.query<Site[], void>({
      query: () => '/sites',

      transformResponse: (response: any) => {
        if (!response || !response.data) {
          console.warn("Invalid sites response:", response);
          return [];
        }
        return response.data;
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sites' as const, id })),
              { type: 'Sites', id: 'LIST' },
            ]
          : [{ type: 'Sites', id: 'LIST' }],
    }),

    getSiteById: builder.query<Site, number>({
      query: (id) => `/sites/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Sites', id },
      ],
    }),

    createSite: builder.mutation<Site, { name: string; subdomain: string }>({
      query: (data) => ({
        url: '/sites',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Sites', id: 'LIST' }],
    }),

    updateSite: builder.mutation<
      Site,
      { id: number; name?: string; title?: string; description?: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/sites/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Sites', id },
      ],
    }),

    deleteSite: builder.mutation<void, number>({
      query: (id) => ({
        url: `/sites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Sites', id: 'LIST' }],
    }),
    getPublicSite:

builder.query<
  Site,
  number
>({

  query:
    (siteId) => ({

      url:

`https://backend-rmfq.onrender.com/p/public/sites/${siteId}`,

      method:
        "GET"
    }),

  transformResponse:
    (response:any) =>

      response.data,
}),

  }),
});

export const {

  useGetPublicSiteQuery,

  useGetSitesQuery,

  useGetSiteByIdQuery,

  useCreateSiteMutation,

  useUpdateSiteMutation,

  useDeleteSiteMutation

} = sitesApi;