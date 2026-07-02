import { Request, Response } from "express";
import { askAssistant, editBlockWithAssistant } from "./assistant.service";
import { AuthRequest } from "../../../shared/auth.util";
import { recordAiActivity } from "../history/aiActivity.service";

export const assistant = async (req: Request, res: Response) => {
  try {
    const { prompt, blocks, jsonTree, pageTitle, slug } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required and must be a string",
      });
    }

    const pageBlocks = Array.isArray(blocks)
      ? blocks
      : Array.isArray(jsonTree?.blocks)
        ? jsonTree.blocks
        : Array.isArray(jsonTree)
          ? jsonTree
          : [];

    const result = await askAssistant({
      prompt,
      blocks: pageBlocks,
      pageTitle,
      slug,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("ASSISTANT_ERROR", error);
    res.status(500).json({
      success: false,
      message: error.message || "Assistant failed",
    });
  }
};
export const editSelectedBlock = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      prompt,
      block,
      pageTitle,
      slug,
      siteId,
      pageId
    } = req.body;

    if (
      !prompt ||
      typeof prompt !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    if (!block || !block.id) {
      return res.status(400).json({
        success: false,
        message: "Selected block is required"
      });
    }

    const result =
      await editBlockWithAssistant({
        prompt,
        block,
        pageTitle,
        slug
      });

    const activitySiteId = Number(siteId || 0);
    const activityUserId = Number(req.user?.id || 0);
    if (activitySiteId && activityUserId) {
      await recordAiActivity({
        siteId: activitySiteId,
        userId: activityUserId,
        pageId: Number(pageId) || null,
        eventType: "AI_BLOCK_EDIT",
        details: {
          blockId: block.id,
          blockType: block.type || null,
          instructionPreview: prompt.trim().slice(0, 200),
          source: "ai-assistant"
        }
      });
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error(
      "EDIT_SELECTED_BLOCK_ERROR",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to edit selected block"
    });
  }
};
