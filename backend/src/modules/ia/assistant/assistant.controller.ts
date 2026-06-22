import { Request, Response } from "express";
import { askAssistant } from "./assistant.service";

export const assistant = async (
  req: Request,
  res: Response
) => {
  try {
    const result =
      await askAssistant(
        req.body.prompt
      );

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};