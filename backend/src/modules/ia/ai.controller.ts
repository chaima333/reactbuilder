import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { AiService } from "./ai.service";
import { AiHistoryService } from "./ai.history.service";
import { createDesignCopilotResponse } from "./copilot/designCopilot.service";
import { applyDesignActions } from "./copilot/designActions.transformer";

export const generatePage = async (req: AuthRequest, res: Response) => {
  try {
    // Najem naamlou validation mel log
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

    console.log("📝 GENERATING_PAGE", {
      siteId,
      userId,
      promptLength: prompt.length,
      title: generatedTitle
    });

    // Ngeneri l page
    const page = await AiService.generatePage(
      siteId,
      userId,
      prompt,
      generatedTitle
    );

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
    
    // TODO: replace string-based error matching with AppError classes after demo stabilization.

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
      pageType
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
      createDesignCopilotResponse({
        message: finalMessage,
        category,
        pageTitle,
        slug,
        pageType,
        blocks
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

export const designCopilotApply = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      suggestion,
      actions,
      blocks
    } = req.body;

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

    const designActions =
      suggestion?.actions ||
      actions;

    if (
      !Array.isArray(designActions) ||
      designActions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Design actions are required",
        code: "ACTIONS_REQUIRED"
      });
    }

    const updatedBlocks =
      applyDesignActions(
        blocks,
        designActions
      );

    return res.json({
      success: true,
      data: {
        blocks: updatedBlocks,
        reply:
          suggestion?.title
            ? `✅ Applied: ${suggestion.title}`
            : "✅ Design improvement applied successfully."
      }
    });
  } catch (error: any) {
    console.error("DESIGN_COPILOT_APPLY_ERROR", {
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Failed to apply design improvement",
      code: "DESIGN_APPLY_FAILED"
    });
  }
};