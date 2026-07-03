import {
  Request,
  Response
} from "express";

import {
  answerPlatformQuestion
} from "./platformAssistant.service";

export const sendPlatformAssistantMessage =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const message =
        String(req.body?.message || "")
          .trim();

      const userId =
        Number((req as any).user?.id || 0);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }

      const data =
        await answerPlatformQuestion(
          message
        );

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error(
        "PLATFORM_ASSISTANT_ERROR",
        {
          error:
            error instanceof Error
              ? error.message
              : String(error)
        }
      );

      return res.status(500).json({
        success: false,
        message: "Platform assistant failed to answer",
        code: "PLATFORM_ASSISTANT_FAILED"
      });
    }
  };