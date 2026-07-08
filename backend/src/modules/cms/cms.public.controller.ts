// cms.public.controller.ts
import { Request, Response } from "express";
import { CmsService } from "./cms.service";

export class CmsPublicController {
  static getPublishedEntries = async (req: Request, res: Response) => {
    try {
      const siteId = Number(req.params.siteId);
      const slug = String(req.params.collectionSlug || "").trim();

      if (!siteId || !slug) {
        return res.status(400).json({
          success: false,
          message: "Invalid siteId or collection slug"
        });
      }

      const data = await CmsService.getPublishedEntriesByCollectionSlug(
        siteId,
        slug
      );

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "CMS collection not found"
        });
      }

      console.error("PUBLIC_CMS_ENTRIES_ERROR", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load CMS entries"
      });
    }
  };

  static getPublishedEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = Number(req.params.siteId);

    const collectionSlug = String(
      req.params.collectionSlug || ""
    ).trim();

    const entrySlug = String(
      req.params.entrySlug || ""
    ).trim();

    const data =
      await CmsService.getPublishedEntryBySlug(
        siteId,
        collectionSlug,
        entrySlug
      );

    return res.json({
      success: true,
      data
    });
  } catch (error) {

    if (
      error instanceof Error &&
      (
        error.message === "COLLECTION_NOT_FOUND" ||
        error.message === "ENTRY_NOT_FOUND"
      )
    ) {
      return res.status(404).json({
        success: false
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false
    });
  }
};
}

