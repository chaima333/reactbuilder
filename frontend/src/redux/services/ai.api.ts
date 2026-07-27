import { api } from "../api/api";

export type AiTelemetry = {
  task?: string;
  provider?: string;
  model?: string;
  success?: boolean;
  usedFallback?: boolean;
  fallbackReason?: string;
  durationMs?: number;
};

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
    aiTelemetry?: AiTelemetry | null;
    aiGenerationMeta?: any;
  };
  createdAt: string;
};

export type AiAnalyticsCountItem = {
  name: string;
  count: number;
};

export type AiAnalyticsRecentEvent = {
  id: number;
  eventType: string;
  pageId: number | null;
  createdAt: string;
  title: string | null;
  telemetry: AiTelemetry | null;
};

export type AiAnalyticsSummary = {
  totals: {
    totalEvents: number;
    telemetryEvents: number;
    successCount: number;
    failedCount: number;
    fallbackCount: number;
    successRate: number;
    fallbackRate: number;
    averageDurationMs: number;
    feedbackEvents: number;
positiveFeedback: number;
negativeFeedback: number;
feedbackRate: number;
positiveFeedbackRate: number;
negativeFeedbackRate: number;
  };
  byEventType: AiAnalyticsCountItem[];
  byTask: AiAnalyticsCountItem[];
  byProvider: AiAnalyticsCountItem[];
  byModel: AiAnalyticsCountItem[];
  fallbackReasons: AiAnalyticsCountItem[];
  recentEvents: AiAnalyticsRecentEvent[];
};
export type AiFeedbackRating =
  | "positive"
  | "negative";

export type SubmitAiFeedbackInput = {
  siteId: number;
  targetActivityId?: number | null;
  targetEventType?: string | null;
  pageId?: number | null;
  generationId?: number | null;
  rating: AiFeedbackRating;
  comment?: string;
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

    getAiAnalytics: builder.query<AiAnalyticsSummary, number>({
      query: (siteId) => ({
        url: `/sites/${siteId}/ia/analytics`,
        method: "GET"
      }),
      transformResponse: (response: {
        success: boolean;
        data: AiAnalyticsSummary;
      }) => response?.data,
      providesTags: ["AiActivity"]
    }),

    editSelectedBlock: builder.mutation<any, any>({
      query: ({ siteId, ...body }) => ({
        url: `/sites/${siteId}/ia/assistant/edit-block`,
        method: "POST",
        body
      }),
      invalidatesTags: ["AiActivity"]
    }),

    designCopilotChat: builder.mutation<any, any>({
      query: ({ siteId, ...body }) => ({
        url: `/sites/${siteId}/ia/design-copilot/chat`,
        method: "POST",
        body
      }),
      invalidatesTags: ["AiActivity"]
    }),

    designCopilotApply: builder.mutation<any, any>({
      query: ({ siteId, ...body }) => ({
        url: `/sites/${siteId}/ia/design-copilot/apply`,
        method: "POST",
        body
      }),
      invalidatesTags: ["AiActivity"]
    }),
    submitAiFeedback: builder.mutation<
  {
    success: boolean;
    message?: string;
  },
  SubmitAiFeedbackInput
>({
  query: ({
    siteId,
    ...body
  }) => ({
    url:
      `/sites/${siteId}/ia/feedback`,
    method:
      "POST",
    body
  }),
  invalidatesTags:
    ["AiActivity"]
}),
  })
});

export const {
  useGetAiHistoryQuery,
  useGetAiActivityHistoryQuery,
  useGetAiAnalyticsQuery,
  useEditSelectedBlockMutation,
  useDesignCopilotChatMutation,
  useDesignCopilotApplyMutation,
  useSubmitAiFeedbackMutation,
} = aiApi;