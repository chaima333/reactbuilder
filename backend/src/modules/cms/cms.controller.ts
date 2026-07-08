// cms.controller.ts
import { Request, Response } from "express";
import { CmsService } from "./cms.service";

const getSiteId = (req: Request) => Number(req.params.siteId);
const getCollectionId = (req: Request) => Number(req.params.collectionId);
const getCollectionSlug = (req: Request) => String(req.params.collectionSlug || "").trim();
const getFieldId = (req: Request) => Number(req.params.fieldId);
const getEntryId = (req: Request) => Number(req.params.entryId);

export class CmsController {
  // =====================================
  // COLLECTIONS
  // =====================================

  static async getCollections(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const data = await CmsService.getCollections(siteId);
      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load CMS collections"
      });
    }
  }

  // ✅ أضف هذه الدالة
  static async getCollectionById(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const collectionId = getCollectionId(req);

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          message: "Collection ID is required"
        });
      }

      const data = await CmsService.getCollectionById(siteId, collectionId);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load CMS collection"
      });
    }
  }

  static async getCollectionBySlug(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const data = await CmsService.getCollectionBySlug(siteId, slug);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      return res.json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load CMS collection"
      });
    }
  }

  static async createCollection(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const data = await CmsService.createCollection(siteId, req.body || {});
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NAME_REQUIRED") {
        return res.status(400).json({
          success: false,
          message: "Collection name is required"
        });
      }
      if (error.message === "COLLECTION_SLUG_REQUIRED") {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }
      if (error.message === "COLLECTION_SLUG_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Collection slug already exists"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create CMS collection"
      });
    }
  }

  // ✅ أضف هذه الدالة
  static async updateCollection(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const collectionId = getCollectionId(req);

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          message: "Collection ID is required"
        });
      }

      const data = await CmsService.updateCollection(
        siteId,
        collectionId,
        req.body || {}
      );

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      if (error.message === "COLLECTION_SLUG_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Collection slug already exists"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update CMS collection"
      });
    }
  }

  static async updateCollectionBySlug(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const collection = await CmsService.getCollectionBySlug(siteId, slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      const data = await CmsService.updateCollection(
        siteId,
        collection.id,
        req.body || {}
      );

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      if (error.message === "COLLECTION_SLUG_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Collection slug already exists"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update CMS collection"
      });
    }
  }

  // ✅ أضف هذه الدالة
  static async deleteCollection(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const collectionId = getCollectionId(req);

      if (!collectionId) {
        return res.status(400).json({
          success: false,
          message: "Collection ID is required"
        });
      }

      await CmsService.deleteCollection(siteId, collectionId);

      return res.json({ success: true, data: true });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete CMS collection"
      });
    }
  }

  static async deleteCollectionBySlug(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const collection = await CmsService.getCollectionBySlug(siteId, slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      await CmsService.deleteCollection(siteId, collection.id);

      return res.json({ success: true, data: true });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete CMS collection"
      });
    }
  }

  // =====================================
  // FIELDS
  // =====================================

  static async getFields(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const collection = await CmsService.getCollectionBySlug(siteId, slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      const data = await CmsService.getFields(siteId, collection.id);

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load CMS fields"
      });
    }
  }

  static async createField(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const collection = await CmsService.getCollectionBySlug(siteId, slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      const data = await CmsService.createField(siteId, collection.id, req.body || {});

      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      if (error.message === "FIELD_KEY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Field key already exists"
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create CMS field"
      });
    }
  }

  static async updateField(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const fieldId = getFieldId(req);
      const data = await CmsService.updateField(siteId, fieldId, req.body || {});

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "FIELD_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Field not found"
        });
      }
      if (error.message === "FIELD_KEY_EXISTS") {
        return res.status(409).json({
          success: false,
          message: "Field key already exists"
        });
      }
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update CMS field"
      });
    }
  }

  static async deleteField(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const fieldId = getFieldId(req);

      await CmsService.deleteField(siteId, fieldId);

      return res.json({ success: true, data: true });
    } catch (error: any) {
      if (error.message === "FIELD_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Field not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete CMS field"
      });
    }
  }

  // =====================================
  // ENTRIES
  // =====================================

  static async getEntries(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const collection = await CmsService.getCollectionBySlug(siteId, slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      const data = await CmsService.getEntries(siteId, collection.id);

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load CMS entries"
      });
    }
  }

  static async getEntryById(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const entryId = getEntryId(req);

      const data = await CmsService.getEntryById(siteId, entryId);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Entry not found"
        });
      }

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "ENTRY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Entry not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load CMS entry"
      });
    }
  }

  static async createEntry(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const slug = getCollectionSlug(req);

      if (!slug) {
        return res.status(400).json({
          success: false,
          message: "Collection slug is required"
        });
      }

      const collection = await CmsService.getCollectionBySlug(siteId, slug);

      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }

      const data = await CmsService.createEntry(siteId, collection.id, req.body || {});

      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      if (error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Collection not found"
        });
      }
      if (String(error.message).startsWith("REQUIRED_FIELD_MISSING:")) {
        return res.status(400).json({
          success: false,
          message: error.message.replace("REQUIRED_FIELD_MISSING:", "Required field missing: ")
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create CMS entry"
      });
    }
  }

  static async updateEntry(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const entryId = getEntryId(req);
      const data = await CmsService.updateEntry(siteId, entryId, req.body || {});

      return res.json({ success: true, data });
    } catch (error: any) {
      if (error.message === "ENTRY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Entry not found"
        });
      }
      if (String(error.message).startsWith("REQUIRED_FIELD_MISSING:")) {
        return res.status(400).json({
          success: false,
          message: error.message.replace("REQUIRED_FIELD_MISSING:", "Required field missing: ")
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update CMS entry"
      });
    }
  }

  static async deleteEntry(req: Request, res: Response) {
    try {
      const siteId = getSiteId(req);
      const entryId = getEntryId(req);

      await CmsService.deleteEntry(siteId, entryId);

      return res.json({ success: true, data: true });
    } catch (error: any) {
      if (error.message === "ENTRY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Entry not found"
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete CMS entry"
      });
    }
  }
}