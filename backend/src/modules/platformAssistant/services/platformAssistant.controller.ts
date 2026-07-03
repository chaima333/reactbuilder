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
    const message =
      String(
        req.body?.message || ""
      );

    const data =
      answerPlatformQuestion(
        message
      );

    return res.json({
      success: true,
      data
    });
  };