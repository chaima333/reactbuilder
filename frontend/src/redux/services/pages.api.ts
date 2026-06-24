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
export type AiGeneratePageRequest = {
  siteId: number | string;
  title?: string;
  prompt: string;
};

export type AiGeneratePageResponse = Page;

interface ApiResponse<T> {
  data: T;
  message?: string;
}

type StyleSanitizerIssue = {
  path: string;
  reason: string;
  valueType: string;
  preview?: string;
};

const MAX_STYLE_STRING_LENGTH =
  2000;

const isPlainObject = (
  value: unknown
) =>
  !!value &&
  typeof value === "object" &&
  (
    Object.getPrototypeOf(value) ===
      Object.prototype ||
    Object.getPrototypeOf(value) ===
      null
  );

const previewValue = (
  value: unknown
) => {
  try {
    return String(value).slice(
      0,
      160
    );
  } catch {
    return "[unprintable]";
  }
};

const sanitizeStyleForSave = (
  value: unknown,
  path: string,
  issues: StyleSanitizerIssue[]
): any => {
  if (
    value === undefined
  ) {
    issues.push({
      path,
      reason:
        "removed undefined",
      valueType:
        "undefined"
    });
    return undefined;
  }

  if (
    value === null ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    if (
      value.length >
      MAX_STYLE_STRING_LENGTH
    ) {
      issues.push({
        path,
        reason:
          "truncated long string",
        valueType:
          "string",
        preview:
          value.slice(
            0,
            160
          )
      });

      return value.slice(
        0,
        MAX_STYLE_STRING_LENGTH
      );
    }

    return value;
  }

  if (
    typeof value === "number"
  ) {
    if (
      Number.isFinite(
        value
      )
    ) {
      return value;
    }

    issues.push({
      path,
      reason:
        "removed NaN/Infinity",
      valueType:
        "number",
      preview:
        previewValue(
          value
        )
    });
    return undefined;
  }

  if (
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    issues.push({
      path,
      reason:
        "removed non-serializable value",
      valueType:
        typeof value,
      preview:
        previewValue(
          value
        )
    });
    return undefined;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    issues.push({
      path,
      reason:
        "removed array from style",
      valueType:
        "array"
    });
    return undefined;
  }

  if (
    !isPlainObject(
      value
    )
  ) {
    issues.push({
      path,
      reason:
        "removed non-plain object from style",
      valueType:
        value?.constructor?.name ||
        typeof value,
      preview:
        previewValue(
          value
        )
    });
    return undefined;
  }

  const sanitized:
    Record<string, any> = {};

  Object.entries(
    value as Record<string, unknown>
  ).forEach(
    ([key, nested]) => {
      const cleaned =
        sanitizeStyleForSave(
          nested,
          `${path}.${key}`,
          issues
        );

      if (
        cleaned !== undefined
      ) {
        sanitized[key] =
          cleaned;
      }
    }
  );

  return sanitized;
};

const sanitizeBlocksForSave = (
  blocks: Block[] | undefined,
  context: {
    slug?: string;
    title?: string;
    operation: string;
  }
) => {
  if (
    !Array.isArray(
      blocks
    )
  ) {
    return blocks;
  }

  const issues:
    StyleSanitizerIssue[] = [];

  const walk = (
    block: any,
    path: string
  ): any => {
    if (
      !block ||
      typeof block !== "object"
    ) {
      return block;
    }

    const next = {
      ...block,
      data: {
        ...(block.data || {})
      },
      children:
        Array.isArray(
          block.children
        )
          ? block.children.map(
              (child: any, index: number) =>
                walk(
                  child,
                  `${path}.children[${index}]`
                )
            )
          : []
    };

    if (
      block.data?.style
    ) {
      next.data.style =
        sanitizeStyleForSave(
          block.data.style,
          `${path}.data.style`,
          issues
        ) || {};
    }

    if (
      block.style
    ) {
      next.style =
        sanitizeStyleForSave(
          block.style,
          `${path}.style`,
          issues
        ) || {};
    }

    return next;
  };

  const sanitized =
    blocks.map(
      (block, index) =>
        walk(
          block,
          `blocks[${index}]`
        )
    );

  if (
    issues.length
  ) {
    console.warn(
      "PAGE_BLOCK_STYLE_SERIALIZATION_SANITIZER",
      {
        ...context,
        isViPlatform:
          context.slug ===
          "vi-platform",
        issueCount:
          issues.length,
        issues
      }
    );
  }

  return sanitized;
};

const sanitizePageMutationData = <
  T extends {
    blocks?: Block[];
    slug?: string;
    title?: string;
  }
>(
  data: T,
  operation: string
): T => ({
  ...data,
  blocks:
    sanitizeBlocksForSave(
      data.blocks,
      {
        slug:
          data.slug,
        title:
          data.title,
        operation
      }
    ) as T["blocks"]
});

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
    generateFigmaPluginToken: builder.mutation<any, void>({
  query: () => ({
    url: "/figma-plugin/token",
    method: "POST"
  })
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
      query: ({ siteId, ...data }) => {
        const sanitizedData =
          sanitizePageMutationData(
            data,
            "createPage"
          );

        return {
          url: `/sites/${siteId}/pages`,
          method: 'POST',
          body: sanitizedData,
        };
      },
      invalidatesTags: [{ type: 'Pages', id: 'LIST' }],
    }),

    generateAiPage: builder.mutation<
  AiGeneratePageResponse,
  AiGeneratePageRequest
>({
  query: ({ siteId, title, prompt }) => ({
    url: `/sites/${siteId}/ia/generate-page`,
    method: "POST",
    body: {
      title,
      prompt
    }
  }),
  transformResponse: (response: ApiResponse<Page>) =>
    response.data,
  invalidatesTags: (result, error, { siteId }) => [
    { type: "Pages", id: "LIST" },
    { type: "Sites", id: siteId }
  ],
}),

    updatePage: builder.mutation<Page, { siteId: number | string; pageId: number | string; title?: string; slug?: string; blocks?: Block[]; theme?: any; }>({
      query: ({ siteId, pageId, ...data }) => {
        const sanitizedData =
          sanitizePageMutationData(
            data,
            "updatePage"
          );

        return {
          url: `/sites/${siteId}/pages/${pageId}`,
          method: 'PUT',
          body: sanitizedData,
        };
      },
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
askAssistant: builder.mutation<
  any,
  {
    prompt: string;
    blocks?: Block[];
    pageTitle?: string;
    slug?: string;
  }
>({
  query: (body) => ({
    url: "/ai/assistant",
    method: "POST",
    body
  })
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
  useGenerateFigmaPluginTokenMutation,
  useGenerateAiPageMutation,
  useAskAssistantMutation
} = pagesApi;
