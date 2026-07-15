// src/redux/services/cmsPublic.api.ts
import {
  api
} from "../api/api";

export type PublicCmsEntry =
  Record<string, any> & {
    id: number;
  };

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const unwrap =
  <T,>(response: ApiResponse<T>) =>
    response.data;

export const cmsPublicApi =
  api.injectEndpoints({
    endpoints: (builder) => ({

      // =========================
      // Collection Entries
      // =========================

      getPublicCmsEntries: builder.query<
        PublicCmsEntry[],
        {
          siteId: number | string;
          slug: string;
        }
      >({
        query: ({
          siteId,
          slug
        }) =>
          // ✅ أحذف /api
          `/public/sites/${siteId}/cms/collections/${slug}/entries`,
        transformResponse:
          unwrap<PublicCmsEntry[]>,

        providesTags: [
          "CmsEntries" as any
        ]
      }),

      // =========================
      // Single Entry
      // =========================

      getPublicCmsEntry: builder.query<
        PublicCmsEntry,
        {
          siteId: number | string;
          collectionSlug: string;
          entrySlug: string;
        }
      >({
        query: ({
          siteId,
          collectionSlug,
          entrySlug
        }) =>
          // ✅ أحذف /api
          `/public/sites/${siteId}/cms/collections/${collectionSlug}/entries/${entrySlug}`,
        transformResponse:
          unwrap<PublicCmsEntry>,

        providesTags: [
          "CmsEntries" as any
        ]
      })

    })
  });

export const {
  useGetPublicCmsEntriesQuery,
  useGetPublicCmsEntryQuery
} = cmsPublicApi;