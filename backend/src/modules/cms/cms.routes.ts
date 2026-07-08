// cms.routes.ts
import { Router } from "express";
import { CmsController } from "./cms.controller"; // ✅ أضف هذا السطر

const router = Router({
  mergeParams: true
});

// Collections
router.get("/collections", CmsController.getCollections);
router.post("/collections", CmsController.createCollection);
router.get("/collections/:collectionSlug", CmsController.getCollectionBySlug);
router.put("/collections/:collectionSlug", CmsController.updateCollectionBySlug);
router.delete("/collections/:collectionSlug", CmsController.deleteCollectionBySlug);

// Fields
router.get("/collections/:collectionSlug/fields", CmsController.getFields);
router.post("/collections/:collectionSlug/fields", CmsController.createField);
router.put("/fields/:fieldId", CmsController.updateField);
router.delete("/fields/:fieldId", CmsController.deleteField);

// Entries
router.get("/collections/:collectionSlug/entries", CmsController.getEntries);
router.post("/collections/:collectionSlug/entries", CmsController.createEntry);
router.get("/entries/:entryId", CmsController.getEntryById);
router.put("/entries/:entryId", CmsController.updateEntry);
router.delete("/entries/:entryId", CmsController.deleteEntry);

export default router;