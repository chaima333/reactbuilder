import { api } from '../api/api';
import { Block } from '../../modules/pageBuilder/types/page.types';

export type Page = {
  id: number;
  title: string;
  blocks: Block[]; 
  slug: string;
  siteId: number;
  userId: number;
  status: "draft" | "published"; // 👈 أضفنا الـ status
  theme: any; // اختصرتها هنا للوضوح
};

export type PageVersion = {
  id: number;
  pageId: number;
  versionNumber: number;
  blocks: Block[];
  createdAt: string;
};

// تعريف الواجهة للردود التي تحتوي على data wrapper
interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // 1. جلب كل الصفحات مع فك التغليف
    getPages: builder.query<Page[], number>({
      query: (siteId) => `/sites/${siteId}/pages`,
      transformResponse: (response: ApiResponse<Page[]>) => response.data, // 👈 مهم جداً
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Pages' as const, id })),
              { type: 'Pages', id: 'LIST' },
            ]
          : [{ type: 'Pages', id: 'LIST' }],
    }),

    getPageById: builder.query<Page, { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}`,
      transformResponse: (response: ApiResponse<Page>) => response.data, // 👈 فك التغليف
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: pageId }],
    }),

    // 2. إضافة عملية الـ Publish
    publishPage: builder.mutation<Page, { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => ({
        url: `/sites/${siteId}/pages/${pageId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: 'Pages', id: pageId },
        { type: 'Pages', id: 'LIST' }
      ],
    }),

    getPageVersions: builder.query<PageVersion[], { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}/versions`,
      transformResponse: (response: ApiResponse<PageVersion[]>) => response.data,
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: `VERSIONS-${pageId}` }],
    }),

    restorePageVersion: builder.mutation<Page, { siteId: number | string; pageId: number | string; versionId: number | string }>({
      query: ({ siteId, pageId, versionId }) => ({
        url: `/sites/${siteId}/pages/${pageId}/restore/${versionId}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: 'Pages', id: pageId },
        { type: 'Pages', id: `VERSIONS-${pageId}` },
        { type: 'Pages', id: 'LIST' }
      ],
    }),

    createPage: builder.mutation<Page, { siteId: number; title: string; blocks: Block[] }>({
      query: ({ siteId, ...data }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Pages', id: 'LIST' }], // 👈 لتحديث القائمة فوراً
    }),

    updatePage: builder.mutation<Page, { siteId: number | string; pageId: number | string; title?: string; blocks?: Block[]; theme?: any; }>({
      query: ({ siteId, pageId, ...data }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { pageId }) => [
        { type: 'Pages', id: pageId },
        { type: 'Pages', id: `VERSIONS-${pageId}` },
        { type: 'Pages', id: 'LIST' }
      ],
    }),

    deletePage: builder.mutation<void, { siteId: number; pageId: number }>({
      query: ({ siteId, pageId }) => ({
        url: `/sites/${siteId}/pages/${pageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Pages', id: 'LIST' }],
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
  usePublishPageMutation, // 👈 لا تنسى تصديرها
} = pagesApi;