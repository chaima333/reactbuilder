import { api } from "../api/api";

export type AiActivityEvent = {
  id: number;
  siteId: number;
  userId: number;
  pageId: number | null;
  eventType: string;
  details?: {
    suggestionTitle?: string | null;
    actionsCount?: number;
    actions?: Array<{ improvement?: string }>;
    title?: string;
    message?: string;
    errorCode?: string;
    suggestionsCount?: number;
    blockId?: string;
    blockType?: string;
    promptPreview?: string;
    messagePreview?: string;
    instructionPreview?: string;
    source?: string;
  };
  createdAt: string;
};

export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({

    getAiHistory: builder.query<any, number>({
      query: (siteId) =>
        `/sites/${siteId}/ia/history`,
      providesTags: ["Dashboard"]
    }),

   getAiActivityHistory: builder.query<AiActivityEvent[], number>({
  query: (siteId) => ({
    url: `/sites/${siteId}/ia/activity-history`,
    method: "GET"
  }),
  transformResponse: (response: {
    success: boolean;
    data: AiActivityEvent[];
  }) => response?.data || [],
  providesTags: ["AiActivity"]
}),

  editSelectedBlock: builder.mutation<any, any>({
  query: (body) => ({
    url: "/ai/assistant/edit-block",
    method: "POST",
    body
  }),
  invalidatesTags: ["AiActivity"],
}),
designCopilotChat: builder.mutation<any, any>({
  query: ({ siteId, ...body }) => ({
    url: `/sites/${siteId}/ia/design-copilot/chat`,
    method: "POST",
    body,
  }),
  invalidatesTags: ["AiActivity"],
}),

designCopilotApply: builder.mutation<any, any>({
  query: ({ siteId, ...body }) => ({
    url: `/sites/${siteId}/ia/design-copilot/apply`,
    method: "POST",
    body,
  }),
  invalidatesTags: ["AiActivity"],
}),
})

  })

export const {
  useGetAiHistoryQuery,
  useGetAiActivityHistoryQuery,
  useEditSelectedBlockMutation,
  useDesignCopilotChatMutation,
  useDesignCopilotApplyMutation
} = aiApi;
