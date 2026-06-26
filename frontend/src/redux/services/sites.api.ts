import { api } from "../api/api";

import {
  Page
} from "./pages.api";

export type SiteRole =
  | "OWNER"
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

export type Site = {
  id: number;
  name: string;
  subdomain: string;
  title?: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;

  role?: SiteRole;
  memberRole?: SiteRole;

  pages?: Page[];
};

export type SitesResponse = {
  success: boolean;
  data: Site[];
};

export type SiteAccess = {
  siteId: number;
  role: SiteRole;
};

export const sitesApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getSites: builder.query<Site[], void>({
      query: () => "/sites",

      transformResponse: (response: any) => {
        if (!response || !response.data) {
          console.warn(
            "Invalid sites response:",
            response
          );

          return [];
        }

        return response.data;
      },

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Sites" as const,
                id
              })),
              {
                type: "Sites",
                id: "LIST"
              },
            ]
          : [
              {
                type: "Sites",
                id: "LIST"
              }
            ],
    }),

    getSiteById: builder.query<Site, number>({
      query: (id) =>
        `/sites/${id}`,

      transformResponse: (response: any) =>
        response?.data || response,

      providesTags: (result, error, id) => [
        {
          type: "Sites",
          id
        },
      ],
    }),

    getSiteAccess: builder.query<
      SiteAccess,
      number
    >({
      query: (siteId) =>
        `/sites/${siteId}/access`,

      transformResponse: (response: any) =>
        response?.data || response,

      providesTags: (result, error, siteId) => [
        {
          type: "Sites",
          id: siteId
        }
      ],
    }),

    createSite: builder.mutation<
      Site,
      {
        name: string;
        subdomain: string;
      }
    >({
      query: (data) => ({
        url: "/sites",
        method: "POST",
        body: data,
      }),

      invalidatesTags: [
        {
          type: "Sites",
          id: "LIST"
        }
      ],
    }),

    updateSite: builder.mutation<
      Site,
      {
        id: number;
        name?: string;
        title?: string;
        description?: string;
      }
    >({
      query: ({
        id,
        ...data
      }) => ({
        url: `/sites/${id}`,
        method: "PUT",
        body: data,
      }),

      invalidatesTags: (result, error, { id }) => [
        {
          type: "Sites",
          id
        },
        {
          type: "Sites",
          id: "LIST"
        },
      ],
    }),

    deleteSite: builder.mutation<void, number>({
      query: (id) => ({
        url: `/sites/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Sites",
          id: "LIST"
        }
      ],
    }),

    getPublicSite: builder.query<
      Site,
      number
    >({
      query: (siteId) => ({
        url:
          `https://backend-rmfq.onrender.com/p/public/sites/${siteId}`,
        method: "GET"
      }),

      transformResponse: (response: any) =>
        response.data,

      providesTags: (result, error, siteId) => [
        {
          type: "Sites",
          id: siteId
        }
      ],
    }),

  }),
});

export const {
  useGetPublicSiteQuery,
  useGetSitesQuery,
  useGetSiteByIdQuery,
  useGetSiteAccessQuery,
  useCreateSiteMutation,
  useUpdateSiteMutation,
  useDeleteSiteMutation
} = sitesApi;