import { api } from '../api/api';
import { Block } from '../../modules/pageBuilder/types/page.types';

export type Page = {
  id: number;
  title: string;
  blocks: Block[];
  slug: string;
  siteId: number;
  userId: number;
  status: "draft" | "published" | "deleted";
  theme: any;
};

export type PageVersion = {
  id: number;
  pageId: number;
  versionNumber: number;
  blocks: Block[];
  createdAt: string;
};

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1. جلب كل الصفحات
    getPages: builder.query<Page[], number>({
      query: (siteId) => `/sites/${siteId}/pages`,
      transformResponse: (response: ApiResponse<Page[]>) =>
        response.data.filter((page) => page.status !== "deleted"),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Pages' as const, id })),
              { type: 'Pages', id: 'LIST' },
            ]
          : [{ type: 'Pages', id: 'LIST' }],
    }),

    // 2. جلب صفحة بالـ ID
    getPageById: builder.query<Page, { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}`,
      transformResponse: (response: ApiResponse<Page>) => response.data,
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: pageId }],
    }),

    // 3. عملية الـ Publish
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

    // 4. جلب نسخ الصفحة (Versions)
    getPageVersions: builder.query<PageVersion[], { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}/versions`,
      transformResponse: (response: ApiResponse<PageVersion[]>) => response.data,
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: `VERSIONS-${pageId}` }],
    }),

    // 5. استرجاع نسخة قديمة
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

    // 6. إنشاء صفحة جديدة
    createPage: builder.mutation<Page, { siteId: number; title: string; slug: string; blocks: Block[] }>({
      query: ({ siteId, ...data }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Pages', id: 'LIST' }],
    }),

    // 7. تحديث صفحة
    updatePage: builder.mutation<Page, { siteId: number | string; pageId: number | string; title?: string; slug?: string; blocks?: Block[]; theme?: any; }>({
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

   getPublicPage: builder.query<Page, { siteId?: string | number; slug?: string }>({
  query: ({ siteId, slug }) => `/api/public/pages/${siteId}/${slug}`,
  transformResponse: (response: ApiResponse<Page>) => response.data,
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
  usePublishPageMutation,
  useGetPublicPageQuery
} = pagesApi;