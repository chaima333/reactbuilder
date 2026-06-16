import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { AiService } from "./ai.service";

export const generatePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = Number(req.siteContext.siteId);
    const userId = Number(req.user.id);

    const { prompt, title } = req.body;

    const page = await AiService.generatePage(
      siteId,
      userId,
      prompt,
      title
    );

    return res.status(201).json({
      success: true,
      data: page
    });

  } catch (error: any) {
    if (error.message === "PROMPT_REQUIRED") {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    if (error.message === "PAGE_ALREADY_EXISTS") {
      return res.status(409).json({
        success: false,
        message: "Page already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};