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


type AiFeedbackRating =
  | "positive"
  | "negative";

type RecordAiFeedbackInput = {
  siteId: number;
  userId: number;
  pageId?: number | null;
  generationId?: number | null;
  targetActivityId?: number | null;
  targetEventType?: string | null;
  rating: AiFeedbackRating;
  comment?: string;
  details?: Record<string, any>;
};

export const recordAiFeedback = async (
  input: RecordAiFeedbackInput
) => {
  const rating: AiFeedbackRating =
    input.rating === "negative"
      ? "negative"
      : "positive";

  await recordAiActivity({
    siteId: input.siteId,
    userId: input.userId,
    pageId: input.pageId || null,
    generationId: input.generationId || null,
    eventType: "AI_FEEDBACK",
    details: {
      targetActivityId:
        input.targetActivityId || null,

      targetEventType:
        input.targetEventType || null,

      rating,

      comment:
        input.comment
          ? input.comment.slice(0, 500)
          : "",

      ...(input.details || {})
    }
  });
};

export const getAiActivityHistory = async (
  siteId: number,
  limit = 20
) => AiActivityEvent.findAll({
  where: { siteId },
  order: [["createdAt", "DESC"]],
  limit
});
