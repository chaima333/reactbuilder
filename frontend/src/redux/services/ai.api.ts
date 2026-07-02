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
}),
designCopilotChat: builder.mutation<any, any>({
  query: ({ siteId, ...body }) => ({
    url: `/sites/${siteId}/ia/design-copilot/chat`,
    method: "POST",
    body,
  }),
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
