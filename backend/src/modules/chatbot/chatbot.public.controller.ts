import { Request, Response } from "express";

import {
  answerSiteQuestion
} from "./services/chatbotAnswer.service";
import {
  getPublicChatbotConfig
} from "./services/chatbotConfig.service";

export const getPublicChatbotConfiguration = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = Number(req.params.siteId);
    const config =
      await getPublicChatbotConfig(siteId);

    return res.json({
      success: true,
      data: config
    });
  } catch (error) {
    const errorCode =
      error instanceof Error
        ? error.message
        : "";

    if (errorCode === "INVALID_SITE_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid site id",
        code: "INVALID_SITE_ID"
      });
    }

    if (
      errorCode ===
      "CHATBOT_SITE_NOT_AVAILABLE"
    ) {
      return res.status(404).json({
        success: false,
        message: "Chatbot is not available",
        code: "CHATBOT_NOT_AVAILABLE"
      });
    }

    console.error(
      "PUBLIC_CHATBOT_CONFIG_ERROR",
      {
        error:
          error instanceof Error
            ? error.message
            : String(error)
      }
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load chatbot configuration",
      code: "CHATBOT_CONFIG_FAILED"
    });
  }
};

export const sendPublicChatbotMessage = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId =
      Number(req.params.siteId);

    const message =
      String(req.body?.message || "")
        .trim();

    const result =
      await answerSiteQuestion(
        siteId,
        message
      );

    return res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error(
      "PUBLIC_CHATBOT_MESSAGE_ERROR",
      {
        message: error.message,
        stack: error.stack
      }
    );

    return res.status(500).json({
      success: false,
      message: "Chatbot failed to answer",
      code: "CHATBOT_FAILED"
    });
  }
};
