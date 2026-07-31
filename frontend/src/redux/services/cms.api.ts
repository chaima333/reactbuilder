import {
  api
} from "../api/api";

export type CmsFieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "image"
  | "date"
  | "select";

export type CmsEntryStatus =
  | "draft"
  | "published";

export type CmsField = {
  id: number;
  collectionId: number;
  name: string;
  key: string;
  type: CmsFieldType;
  required: boolean;
  order: number;
  settings?: Record<string, any>;
};

export type CmsEntry = {
  id: number;
  siteId: number;
  collectionId: number;
  status: CmsEntryStatus;
  data: Record<string, any>;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CmsCollection = {
  id: number;
  siteId: number;
  name: string;
  slug: string;
  description?: string | null;

  templatePageId?: number | null;

  templatePage?: {
    id: number;
    title: string;
    slug: string;
    blocks?: any[];
  } | null;

  fields?: CmsField[];
  entries?: CmsEntry[];
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

export type CmsApiErrorCode =
  | "CMS_ENTRY_SLUG_CONFLICT"
  | "CMS_ENTRY_SLUG_INVALID"
  | "CMS_ENTRY_SLUG_TOO_LONG";

const unwrap =
  <T,>(response: ApiResponse<T>) =>
    response.data;

export const cmsApi =
  api.injectEndpoints({
    endpoints: (builder) => ({
      getCmsCollections: builder.query<
        CmsCollection[],
        number | string
      >({
        query: (siteId) =>
          `/sites/${siteId}/cms/collections`,

        transformResponse:
          unwrap<CmsCollection[]>,

        providesTags: [
          "CmsCollections" as any
        ]
      }),

      getCmsCollection: builder.query<
        CmsCollection,
        {
          siteId: number | string;
          collectionId: number | string; 
        }
      >({
        query: ({
          siteId, collectionId}) =>
          `/sites/${siteId}/cms/collections/${collectionId}`, 

        transformResponse:
          unwrap<CmsCollection>,

        providesTags: [
          "CmsCollections" as any,
          "CmsFields" as any,
          "CmsEntries" as any
        ]
      }),

      createCmsCollection: builder.mutation<
        CmsCollection,
        {
          siteId: number | string;
          body: {
            name: string;
            slug?: string;
            description?: string;
            templatePageId?: number | null;
          };
        }
      >({
        query: ({
          siteId,
          body
        }) => ({
          url:
            `/sites/${siteId}/cms/collections`,
          method: "POST",
          body
        }),

        transformResponse:
          unwrap<CmsCollection>,

        invalidatesTags: [
          "CmsCollections" as any
        ]
      }),

      createCmsField: builder.mutation<
        CmsField,
        {
          siteId: number | string;
          collectionId: number | string;
          body: {
            name: string;
            key?: string;
            type?: CmsFieldType;
            required?: boolean;
            order?: number;
            settings?: Record<string, any>;
          };
        }
      >({
        query: ({
          siteId,
          collectionId,
          body
        }) => ({
          url:
            `/sites/${siteId}/cms/collections/${collectionId}/fields`,
          method: "POST",
          body
        }),

        transformResponse:
          unwrap<CmsField>,

        invalidatesTags: [
          "CmsCollections" as any,
          "CmsFields" as any
        ]
      }),

      updateCmsCollection: builder.mutation<
  CmsCollection,
  {
    siteId: number | string;
    collectionId: number | string;
    body: {
      name?: string;
      slug?: string;
      description?: string;
      templatePageId?: number | null;
    };
  }
>({
  query: ({
    siteId,
    collectionId,
    body
  }) => ({
    url:
      `/sites/${siteId}/cms/collections/${collectionId}`,
    method: "PUT",
    body
  }),

  transformResponse:
    unwrap<CmsCollection>,

  invalidatesTags: [
    "CmsCollections" as any,
    "CmsFields" as any,
    "CmsEntries" as any
  ]
}),

deleteCmsCollection: builder.mutation<
  boolean,
  {
    siteId: number | string;
    collectionId: number | string;
  }
>({
  query: ({
    siteId,
    collectionId
  }) => ({
    url:
      `/sites/${siteId}/cms/collections/${collectionId}`,
    method: "DELETE"
  }),

  transformResponse:
    unwrap<boolean>,

  invalidatesTags: [
    "CmsCollections" as any,
    "CmsFields" as any,
    "CmsEntries" as any
  ]
}),
updateCmsField: builder.mutation<
  CmsField,
  {
    siteId: number | string;
    fieldId: number | string;
    body: {
      name?: string;
      key?: string;
      type?: CmsFieldType;
      required?: boolean;
      order?: number;
      settings?: Record<string, any>;
    };
  }
>({
  query: ({
    siteId,
    fieldId,
    body
  }) => ({
    url:
      `/sites/${siteId}/cms/fields/${fieldId}`,
    method: "PUT",
    body
  }),

  transformResponse:
    unwrap<CmsField>,

  invalidatesTags: [
    "CmsCollections" as any,
    "CmsFields" as any
  ]
}),

deleteCmsField: builder.mutation<
  boolean,
  {
    siteId: number | string;
    fieldId: number | string;
  }
>({
  query: ({
    siteId,
    fieldId
  }) => ({
    url:
      `/sites/${siteId}/cms/fields/${fieldId}`,
    method: "DELETE"
  }),

  transformResponse:
    unwrap<boolean>,

  invalidatesTags: [
    "CmsCollections" as any,
    "CmsFields" as any,
    "CmsEntries" as any
  ]
}),



      createCmsEntry: builder.mutation<
        CmsEntry,
        {
          siteId: number | string;
          collectionId: number | string;
          body: {
            status?: CmsEntryStatus;
            slug?: string;
            data: Record<string, any>;
          };
        }
      >({
        query: ({
          siteId,
          collectionId,
          body
        }) => ({
          url:
            `/sites/${siteId}/cms/collections/${collectionId}/entries`,
          method: "POST",
          body
        }),

        transformResponse:
          unwrap<CmsEntry>,

        invalidatesTags: [
          "CmsCollections" as any,
          "CmsEntries" as any
        ]
      }),

      updateCmsEntry: builder.mutation<
        CmsEntry,
        {
          siteId: number | string;
          entryId: number | string;
          body: {
            status?: CmsEntryStatus;
            slug?: string;
            data?: Record<string, any>;
          };
        }
      >({
        query: ({
          siteId,
          entryId,
          body
        }) => ({
          url:
            `/sites/${siteId}/cms/entries/${entryId}`,
          method: "PUT",
          body
        }),

        transformResponse:
          unwrap<CmsEntry>,

        invalidatesTags: [
          "CmsCollections" as any,
          "CmsEntries" as any
        ]
      }),

      deleteCmsEntry: builder.mutation<
        boolean,
        {
          siteId: number | string;
          entryId: number | string;
        }
      >({
        query: ({
          siteId,
          entryId
        }) => ({
          url:
            `/sites/${siteId}/cms/entries/${entryId}`,
          method: "DELETE"
        }),

        transformResponse:
          unwrap<boolean>,

        invalidatesTags: [
          "CmsCollections" as any,
          "CmsEntries" as any
        ]
      }),
    })
  });

export const {
  useGetCmsCollectionsQuery,
  useGetCmsCollectionQuery,
  useCreateCmsCollectionMutation,
  useUpdateCmsCollectionMutation,
  useDeleteCmsCollectionMutation,
  useCreateCmsFieldMutation,
  useUpdateCmsFieldMutation,
  useDeleteCmsFieldMutation,
  useCreateCmsEntryMutation,
  useUpdateCmsEntryMutation,
  useDeleteCmsEntryMutation
} = cmsApi;
