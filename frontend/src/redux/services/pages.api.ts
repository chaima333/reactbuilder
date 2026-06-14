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
   isHomepage?: boolean;
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

    getPageById: builder.query<Page, { siteId: number | string; pageId: number | string }>({
      query: ({ siteId, pageId }) => `/sites/${siteId}/pages/${pageId}`,
      transformResponse: (response: ApiResponse<Page>) => response.data,
      providesTags: (result, error, { pageId }) => [{ type: 'Pages', id: pageId }],
    }),

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

    createPage: builder.mutation<Page, { siteId: number; title: string; slug: string; blocks: Block[],isHomepage?: boolean; }>({
      query: ({ siteId, ...data }) => ({
        url: `/sites/${siteId}/pages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Pages', id: 'LIST' }],
    }),

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

    importFigma: builder.mutation<
  any,
  {
    siteId: number | string;
    fileKey: string;
    frameId?: string;
  }
>({
  query: ({ siteId, fileKey, frameId }) => ({
    url: `/sites/${siteId}/pages/figma/import`,
    method: "POST",
    body: {
      fileKey,
      frameId
    }
  }),
}),
uploadHtmlZip: builder.mutation<
  {
    success: boolean;
    assetMap: Record<string, string>;
    globalLayout?: {
      navHtml?: string;
      footerHtml?: string;
    };
    pages: {
      title: string;
      slug: string;
      sourceFile: string;
      processedHtml: string;
      isHomepage?: boolean;
    }[];
  },
  {
    siteId: number | string;
    file: File;
  }
>({
  query: ({ siteId, file }) => {
    const formData = new FormData();

    formData.append("zip", file);

    return {
      url: `/sites/${siteId}/import/html-zip`,
      method: "POST",
      body: formData
    };
  }
}),
updateGlobalLayout: builder.mutation<
  any,
  {
    siteId: number | string;
    globalLayout: {
      navbar: Block | null;
      footer: Block | null;
    };
  }
>({
  query: ({ siteId, globalLayout }) => ({
    url: `/sites/${siteId}/global-layout`,
    method: "PUT",
    body: globalLayout
  })
}),
 getPublicPage:

builder.query<
  Page,
  {
    siteId?: string | number;
    slug?: string;
  }
>({

  query: ({

    siteId,

    slug

  }) => ({

    url:

`https://backend-rmfq.onrender.com/p/public/pages/${siteId}/${slug}`,

    method: "GET"
  }),

  transformResponse:

    (
      response:
        ApiResponse<Page>
    ) =>

      response.data,
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
  useGetPublicPageQuery,
  useImportFigmaMutation,
  useUploadHtmlZipMutation,
  useUpdateGlobalLayoutMutation,
} = pagesApi;
