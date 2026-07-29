import {
  api
} from "../api/api";

import type {
  Block
} from "../../modules/pageBuilder/types/page.types";

export type BlockPattern = {
  id: number;
  siteId: number;
  createdBy?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  rootBlock: Block;
  blockType: string;
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBlockPatternPayload = {
  siteId: number | string;
  name: string;
  description?: string | null;
  rootBlock: Block;
  metadata?: Record<string, unknown>;
};

export type UpdateBlockPatternPayload = {
  siteId: number | string;
  patternId: number | string;
  name?: string;
  description?: string | null;
  rootBlock?: Block;
  metadata?: Record<string, unknown>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

const unwrap =
  <T,>(response: ApiResponse<T>) =>
    response.data;

export const patternsApi =
  api.injectEndpoints({
    endpoints: (builder) => ({
      getPatterns: builder.query<
        BlockPattern[],
        number | string
      >({
        query: (siteId) =>
          `/sites/${siteId}/patterns`,

        transformResponse:
          unwrap<BlockPattern[]>,

        providesTags: (result) =>
          result
            ? [
                ...result.map((pattern) => ({
                  type: "Patterns" as const,
                  id: pattern.id
                })),
                {
                  type: "Patterns" as const,
                  id: "LIST"
                }
              ]
            : [
                {
                  type: "Patterns" as const,
                  id: "LIST"
                }
              ]
      }),

      getPattern: builder.query<
        BlockPattern,
        {
          siteId: number | string;
          patternId: number | string;
        }
      >({
        query: ({
          siteId,
          patternId
        }) =>
          `/sites/${siteId}/patterns/${patternId}`,

        transformResponse:
          unwrap<BlockPattern>,

        providesTags: (_result, _error, { patternId }) => [
          {
            type: "Patterns" as const,
            id: patternId
          }
        ]
      }),

      createPattern: builder.mutation<
        BlockPattern,
        CreateBlockPatternPayload
      >({
        query: ({
          siteId,
          name,
          description,
          rootBlock,
          metadata
        }) => ({
          url:
            `/sites/${siteId}/patterns`,
          method: "POST",
          body: {
            name,
            description,
            rootBlock,
            metadata
          }
        }),

        transformResponse:
          unwrap<BlockPattern>,

        invalidatesTags: [
          {
            type: "Patterns" as const,
            id: "LIST"
          }
        ]
      }),

      updatePattern: builder.mutation<
        BlockPattern,
        UpdateBlockPatternPayload
      >({
        query: ({
          siteId,
          patternId,
          ...body
        }) => ({
          url:
            `/sites/${siteId}/patterns/${patternId}`,
          method: "PUT",
          body
        }),

        transformResponse:
          unwrap<BlockPattern>,

        invalidatesTags: (_result, _error, { patternId }) => [
          {
            type: "Patterns" as const,
            id: patternId
          },
          {
            type: "Patterns" as const,
            id: "LIST"
          }
        ]
      }),

      deletePattern: builder.mutation<
        boolean,
        {
          siteId: number | string;
          patternId: number | string;
        }
      >({
        query: ({
          siteId,
          patternId
        }) => ({
          url:
            `/sites/${siteId}/patterns/${patternId}`,
          method: "DELETE"
        }),

        transformResponse:
          unwrap<boolean>,

        invalidatesTags: (_result, _error, { patternId }) => [
          {
            type: "Patterns" as const,
            id: patternId
          },
          {
            type: "Patterns" as const,
            id: "LIST"
          }
        ]
      })
    })
  });

export const {
  useGetPatternsQuery,
  useCreatePatternMutation,
  useGetPatternQuery,
  useUpdatePatternMutation,
  useDeletePatternMutation
} = patternsApi;
