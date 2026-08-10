import {
  Request,
  Response
} from "express";

import {
  answerPlatformQuestion,
  getPlatformAssistantDocs
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

      const safeHistory =
        Array.isArray(req.body?.history)
          ? req.body.history
              .slice(-6)
              .map((item: any) => ({
                role:
                  item?.role === "assistant"
                    ? "assistant"
                    : "user",
                content:
                  String(item?.content || "")
                    .slice(0, 800)
              }))
              .filter((item: any) =>
                item.content.trim()
              )
          : [];

      const context =
        req.body?.context &&
        typeof req.body.context === "object"
          ? {
              pathname:
                String(req.body.context.pathname || "")
                  .slice(0, 300),
              module:
                String(req.body.context.module || "")
                  .slice(0, 80),
              siteId:
                req.body.context.siteId ?? null,
              pageId:
                req.body.context.pageId ?? null,
              globalRole:
                String(
                  req.body.context.globalRole ||
                    (req as any).user?.role ||
                    ""
                ).slice(0, 40),
              locale:
                String(req.body.context.locale || "")
                  .slice(0, 40)
            }
          : {
              globalRole:
                String((req as any).user?.role || "")
            };

      const data =
        await answerPlatformQuestion({
          message,
          context,
          history: safeHistory,
          userRole:
            (req as any).user?.role || null
        });

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

 export const getPlatformAssistantDocumentation =
  async (
    req: Request,
    res: Response
  ) => {
    try {
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
        getPlatformAssistantDocs();

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error(
        "PLATFORM_ASSISTANT_DOCS_ERROR",
        {
          error:
            error instanceof Error
              ? error.message
              : String(error)
        }
      );

      return res.status(500).json({
        success: false,
        message: "Platform assistant documentation failed to load",
        code: "PLATFORM_ASSISTANT_DOCS_FAILED"
      });
    }
  };
