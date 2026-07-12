import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { AiService } from "./ai.service";
import { AiHistoryService } from "./ai.history.service";
import { createDesignCopilotResponse } from "./copilot/designCopilot.service";
import { applyDesignActions } from "./copilot/designActions.transformer";
import { ApplyDesignCopilotSchema } from "./copilot/designCopilot.schema";
import { getAiActivityHistory, recordAiActivity, recordAiFeedback } from "./history/aiActivity.service";
import { getAiAnalyticsSummary } from "./analytics/aiAnalytics.service";

const previewText = (value: unknown) =>
  typeof value === "string" ? value.trim().slice(0, 200) : "";

const getGenerationErrorCode = (error: any) => {
  switch (error?.message) {
    case "PROMPT_REQUIRED": return "PROMPT_REQUIRED";
    case "PAGE_ALREADY_EXISTS": return "PAGE_ALREADY_EXISTS";
    case "ML_SERVICE_ERROR": return "ML_SERVICE_UNAVAILABLE";
    case "SITE_NOT_FOUND":
    case "USER_NOT_FOUND": return "RESOURCE_NOT_FOUND";
    default: return "INTERNAL_SERVER_ERROR";
  }
};

export const generatePage = async (req: AuthRequest, res: Response) => {
  try {
    console.log("🚀 GENERATE_PAGE_STARTED", {
      siteId: req.siteContext?.siteId,
      userId: req.user?.id,
      hasPrompt: !!req.body.prompt
    });

    if (!req.siteContext?.siteId || !req.user?.id) {
  return res.status(401).json({
    success: false,
    message: "Missing site or user context",
    code: "CONTEXT_REQUIRED"
  });
}

    const siteId = Number(req.siteContext.siteId);
    const userId = Number(req.user.id);

    // Nta9ou mel body
    const { prompt, title } = req.body;

    // Validation mte3 prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      await recordAiActivity({
        siteId,
        userId,
        eventType: "AI_PAGE_GENERATION_FAILED",
        details: {
          errorCode: "INVALID_PROMPT",
          message: "Prompt must be at least 3 characters long",
          promptPreview: previewText(prompt),
          source: "ai-page-generator"
        }
      });
      return res.status(400).json({
        success: false,
        message: "Prompt must be at least 3 characters long"
      });
    }

const generatedTitle =
  title?.trim() ||
  prompt
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(" ");

    // Ngeneri l page
    const page = await AiService.generatePage(
      siteId,
      userId,
      prompt,
      generatedTitle,
      req.siteContext.role
    );

    await recordAiActivity({
      siteId,
      userId,
      pageId: page?.id || null,
      eventType: "AI_PAGE_GENERATED",
     details: {
  title: page?.title || generatedTitle,
  promptPreview: previewText(prompt),
  pageId: page?.id || null,
  ...((page as any)?.aiCategory
    ? { category: (page as any).aiCategory }
    : {}),
  aiTelemetry:
    (page as any)?.aiTelemetry || null,
  aiGenerationMeta:
    (page as any)?.aiGenerationMeta || null,
  source: "ai-page-generator"
}
    });

    console.log("✅ PAGE_GENERATED_SUCCESSFULLY", {
      pageId: page?.id,
      siteId,
      userId
    });

    return res.status(201).json({
      success: true,
      data: page,
      meta: {
        generatedAt: new Date().toISOString(),
        siteId,
        userId
      }
    });

  } catch (error: any) {
    // Logging mte3 error
    console.error("❌ GENERATE_PAGE_ERROR", {
      message: error.message,
      stack: error.stack,
      siteId: req.siteContext?.siteId,
      userId: req.user?.id
    });

    const activitySiteId = Number(req.siteContext?.siteId || req.params.siteId || 0);
    const activityUserId = Number(req.user?.id || 0);
    if (activitySiteId && activityUserId) {
      await recordAiActivity({
        siteId: activitySiteId,
        userId: activityUserId,
        eventType: "AI_PAGE_GENERATION_FAILED",
        details: {
          errorCode: getGenerationErrorCode(error),
          message: error?.message || "Page generation failed",
          promptPreview: previewText(req.body?.prompt),
          source: "ai-page-generator"
        }
      });
    }
    
    if (error.message === "PROMPT_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
        code: "PROMPT_REQUIRED"
      });
    }

    if (error.message === "PAGE_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "A page with this title already exists in this site",
        code: "PAGE_ALREADY_EXISTS"
      });
    }

    if (error.message === "ML_SERVICE_ERROR") {
      return res.status(503).json({
        success: false,
        message: "AI service is temporarily unavailable. Please try again later.",
        code: "ML_SERVICE_UNAVAILABLE"
      });
    }

    if (error.message === "SITE_NOT_FOUND" || error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: error.message,
        code: "RESOURCE_NOT_FOUND"
      });
    }

    // Error générique
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while generating the page",
      code: "INTERNAL_SERVER_ERROR"
    });
  }
};

export const getHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const history =
      await AiHistoryService.getHistory(
        req.user.id,
          Number(req.params.siteId)
   );

    res.json({
      success: true,
      data: history
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getActivityHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId = Number(req.siteContext?.siteId);
    if (!siteId) {
      return res.status(400).json({ success: false, message: "Site context missing" });
    }

    const history = await getAiActivityHistory(siteId);
    return res.json({ success: true, data: history });
  } catch (error: any) {
    console.error("AI_ACTIVITY_HISTORY_ERROR", {
      message: error.message,
      siteId: req.siteContext?.siteId
    });
    return res.status(500).json({
      success: false,
      message: "Failed to load AI activity history"
    });
  }
};

export const getAiAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      Number(req.siteContext?.siteId || req.params.siteId);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "Missing site context",
        code: "SITE_CONTEXT_REQUIRED"
      });
    }

    const analytics =
      await getAiAnalyticsSummary(siteId);

    return res.json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error("AI_ANALYTICS_ERROR", {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Failed to load AI analytics",
      code: "AI_ANALYTICS_FAILED"
    });
  }
};

export const designCopilotChat = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      message,
      prompt,
      blocks,
      category,
      pageTitle,
      slug,
      pageType,
      pageId
    } = req.body;

    const finalMessage =
      message || prompt || "";

    if (
      !Array.isArray(blocks) ||
      blocks.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Blocks are required",
        code: "BLOCKS_REQUIRED"
      });
    }

   const result =
  await createDesignCopilotResponse({
    message: finalMessage,
    category,
    pageTitle,
    slug,
    pageType,
    blocks
  });
  const aiTelemetry =
  (result as any)?.aiTelemetry || null;

    await recordAiActivity({
      siteId: Number(req.siteContext.siteId),
      userId: Number(req.user.id),
      pageId: Number(pageId) || null,
      eventType: "DESIGN_COPILOT_CHAT",
     details: {
  messagePreview: previewText(finalMessage),
  suggestionsCount: Array.isArray(result?.suggestions)
    ? result.suggestions.length
    : 0,
  source: "design-copilot",

  aiTelemetry: aiTelemetry
    ? {
        task: aiTelemetry.task,
        provider: aiTelemetry.provider,
        model: aiTelemetry.model,
        success: aiTelemetry.success,
        usedFallback: aiTelemetry.usedFallback,
        fallbackReason: aiTelemetry.fallbackReason,
        durationMs: aiTelemetry.durationMs
      }
    : null
}
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("DESIGN_COPILOT_CHAT_ERROR", {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Design Co-Pilot failed",
      code: "DESIGN_COPILOT_FAILED"
    });
  }
};
export const submitAiFeedback = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const siteId =
      Number(req.siteContext?.siteId || req.params.siteId);

    const userId =
      Number(req.user?.id || 0);

    if (
      !siteId ||
      !userId
    ) {
      return res.status(401).json({
        success: false,
        message: "Missing site or user context",
        code: "CONTEXT_REQUIRED"
      });
    }

    const {
      rating,
      comment,
      pageId,
      generationId,
      targetActivityId,
      targetEventType
    } = req.body || {};

    if (
      rating !== "positive" &&
      rating !== "negative"
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be positive or negative",
        code: "INVALID_FEEDBACK_RATING"
      });
    }

    await recordAiFeedback({
      siteId,
      userId,
      pageId:
        Number(pageId) || null,
      generationId:
        Number(generationId) || null,
      targetActivityId:
        Number(targetActivityId) || null,
      targetEventType:
        targetEventType
          ? String(targetEventType)
          : null,
      rating,
      comment:
        typeof comment === "string"
          ? comment
          : ""
    });

    return res.status(201).json({
      success: true,
      message: "AI feedback recorded"
    });
  } catch (error: any) {
    console.error(
      "AI_FEEDBACK_ERROR",
      {
        message: error.message,
        stack: error.stack
      }
    );

    return res.status(500).json({
      success: false,
      message: "Failed to record AI feedback",
      code: "AI_FEEDBACK_FAILED"
    });
  }
};

export const designCopilotApply = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const validation =
      ApplyDesignCopilotSchema.safeParse(
        req.body
      );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid design action request",
        code: "INVALID_DESIGN_ACTIONS",
        errors: validation.error.issues
      });
    }

    const {
      suggestion,
      actions,
      blocks
    } = validation.data;

    const designActions =
      suggestion?.actions ||
      actions;

    if (
      !Array.isArray(designActions) ||
      designActions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No valid design actions provided",
        code: "NO_DESIGN_ACTIONS"
      });
    }

    const updatedBlocks =
      applyDesignActions(
        blocks,
        designActions
      );

const activitySiteId =
  Number(req.siteContext?.siteId || 0);

const activityUserId =
  Number(
    req.user?.id ||
    (req as any).user?.id ||
    0
  );

const activityPageId =
  Number(
    (validation.data as any).pageId ||
    0
  ) || null;

if (
  !activitySiteId ||
  !activityUserId
) {
  console.warn("AI_ACTIVITY_SKIPPED_CONTEXT_MISSING", {
    activitySiteId,
    activityUserId,
    paramSiteId:
      req.params.siteId,
    contextSiteId:
      req.siteContext?.siteId
  });
}
    if (
      activitySiteId &&
      activityUserId
    ) {
      await recordAiActivity({
        siteId: activitySiteId,
        userId: activityUserId,
        pageId: activityPageId,
        eventType: "DESIGN_COPILOT_APPLY",
        details: {
          suggestionId:
            suggestion?.id || null,
          suggestionTitle:
            suggestion?.title || null,
          actions: designActions,
          actionsCount:
            designActions.length,
          source: "design-copilot"
        }
      });
    }

    return res.json({
  success: true,
  data: {
    blocks: updatedBlocks,
    reply:
      suggestion?.title
        ? `Applied: ${suggestion.title}`
        : "Design improvement applied successfully.",
    activityDebug: {
      reachedApplyController: true,
      triedActivityRecord:
        !!activitySiteId &&
        !!activityUserId,
      siteId: activitySiteId,
      userId: activityUserId,
      pageId: activityPageId,
      actionsCount:
        designActions.length
    }
  }
});
  } catch (error: any) {
    console.error(
      "DESIGN_COPILOT_APPLY_ERROR",
      {
        message: error.message,
        stack: error.stack
      }
    );

    return res.status(500).json({
      success: false,
      message: "Failed to apply design improvement",
      code: "DESIGN_APPLY_FAILED"
    });
  }
};
