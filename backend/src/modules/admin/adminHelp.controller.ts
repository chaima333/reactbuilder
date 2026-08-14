import {
  Request,
  Response
} from "express";

import {
  HelpCenterError,
  HelpCenterService
} from "../platformAssistant/services/helpCenter.service";

const getId = (
  req: Request
) =>
  Number(req.params.id);

const sendError = (
  res: Response,
  error: any,
  fallback: string
) => {
  const status =
    error instanceof HelpCenterError
      ? error.status
      : 500;

  return res.status(status).json({
    success: false,
    message:
      error?.message ||
      fallback
  });
};

export class AdminHelpController {
  static async listCategories(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.listCategories({
          locale:
            String(req.query.locale || "")
              .slice(0, 20),
          includeInactive: true
        });

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to load help categories"
      );
    }
  }

  static async createCategory(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.createCategory(
          req.body || {}
        );

      return res.status(201).json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to create help category"
      );
    }
  }

  static async updateCategory(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.updateCategory(
          getId(req),
          req.body || {}
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to update help category"
      );
    }
  }

  static async deleteCategory(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.deactivateCategory(
          getId(req)
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to deactivate help category"
      );
    }
  }

  static async listArticles(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.listArticles({
          locale:
            String(req.query.locale || "")
              .slice(0, 20),
          query:
            String(req.query.q || "")
              .slice(0, 200),
          categorySlug:
            String(req.query.category || "")
              .slice(0, 160),
          includeInactive: true,
          includeUnpublished: true,
          limit: 500
        });

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to load help articles"
      );
    }
  }

  static async createArticle(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.createArticle(
          req.body || {}
        );

      return res.status(201).json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to create help article"
      );
    }
  }

  static async updateArticle(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.updateArticle(
          getId(req),
          req.body || {}
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to update help article"
      );
    }
  }

  static async deleteArticle(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await HelpCenterService.deleteArticle(
          getId(req)
        );

      return res.json({
        success: true,
        data
      });
    } catch (error: any) {
      return sendError(
        res,
        error,
        "Failed to delete help article"
      );
    }
  }
}
