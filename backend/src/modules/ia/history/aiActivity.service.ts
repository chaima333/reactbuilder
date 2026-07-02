import { AiActivityEvent } from "../../../models/AiActivityEvent";

type RecordAiActivityInput = {
  siteId: number;
  userId: number;
  pageId?: number | null;
  generationId?: number | null;
  eventType: string;
  details?: Record<string, any>;
};

export const recordAiActivity = async (
  input: RecordAiActivityInput
) => {
  try {
    await AiActivityEvent.create({
      siteId: input.siteId,
      userId: input.userId,
      pageId: input.pageId || null,
      generationId: input.generationId || null,
      eventType: input.eventType,
      details: input.details || {}
    });

    console.log("AI_ACTIVITY_RECORDED", {
      eventType: input.eventType,
      siteId: input.siteId,
      userId: input.userId
    });
  } catch (error) {
    console.warn("AI_ACTIVITY_LOG_FAILED", {
      eventType: input.eventType,
      error:
        error instanceof Error
          ? error.message
          : String(error)
    });
  }
};