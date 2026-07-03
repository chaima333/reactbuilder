import { Request, Response } from "express";

import {
  answerSiteQuestion
} from "./services/chatbotAnswer.service";

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