import { api } from '../api/api';
import { Block } from '../../modules/pageBuilder/types/page.types';

export type Page = {
  id: number;
  title: string;
  blocks: Block[]; 
  slug: string;
  siteId: number;
  userId: number;
};

export type PageVersion = {
  id: number;
  pageId: number;
  versionNumber: number;
  blocks: Block[];
  createdAt: string;
};

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getPages: builder.query<Page[], number>({
      query: (siteId) => `/sites/${siteId}/pages`,
      providesTags: ['Pages'],
    }),

    getPageById: builder.query<{ data: Page }, { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}`,
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: pageId }],
    }),

    getPageVersions: builder.query<{ data: PageVersion[] }, { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}/versions`,
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: `VERSIONS-${pageId}` }],
    }),

    restorePageVersion: builder.mutation<{ data: Page }, { siteId: number | string; pageId: number | string; versionId: number | string }>({
      query: ({ siteId, pageId, versionId }) => ({
        url: `/sites/${siteId}/pages/${pageId}/restore/${versionId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: 'Pages', id: pageId },
        { type: 'Pages', id: `VERSIONS-${pageId}` }
      ],
    }),

    createPage: builder.mutation<Page, { siteId: number; title: string; blocks: Block[] }>({
      query: ({ siteId, ...data }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Pages'],
    }),

    updatePage: builder.mutation<Page, { siteId: number | string; pageId: number | string; title?: string; blocks?: Block[] }>({
      query: ({ siteId, pageId, ...data }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: 'Pages', id: pageId },
        { type: 'Pages', id: `VERSIONS-${pageId}` }
      ],
    }),

    deletePage: builder.mutation<void, { siteId: number; pageId: number }>({
      query: ({ siteId, pageId }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pages'],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useGetPageVersionsQuery,
  useRestorePageVersionMutation,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pagesApi;