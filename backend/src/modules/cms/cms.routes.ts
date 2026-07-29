import { Router } from "express";

import { PERMISSIONS } from "../../core/constants/permissions";
import { requirePermission } from "../../core/middleware/role.middleware";
import { CmsController } from "./cms.controller";

const router = Router({
  mergeParams: true
});

// Collections
router.get(
  "/collections",
  requirePermission(PERMISSIONS.PAGE_READ),
  CmsController.getCollections
);

router.post(
  "/collections",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  CmsController.createCollection
);

router.get(
  "/collections/:collectionId",
  requirePermission(PERMISSIONS.PAGE_READ),
  CmsController.getCollectionById
);

router.put(
  "/collections/:collectionId",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  CmsController.updateCollection
);

router.delete(
  "/collections/:collectionId",
  requirePermission(PERMISSIONS.PAGE_DELETE),
  CmsController.deleteCollection
);

// Fields
router.get(
  "/collections/:collectionId/fields",
  requirePermission(PERMISSIONS.PAGE_READ),
  CmsController.getFields
);

router.post(
  "/collections/:collectionId/fields",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  CmsController.createField
);

router.put(
  "/fields/:fieldId",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  CmsController.updateField
);

router.delete(
  "/fields/:fieldId",
  requirePermission(PERMISSIONS.PAGE_DELETE),
  CmsController.deleteField
);

// Entries
router.get(
  "/collections/:collectionId/entries",
  requirePermission(PERMISSIONS.PAGE_READ),
  CmsController.getEntries
);

router.post(
  "/collections/:collectionId/entries",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  CmsController.createEntry
);

router.get(
  "/entries/:entryId",
  requirePermission(PERMISSIONS.PAGE_READ),
  CmsController.getEntryById
);

router.put(
  "/entries/:entryId",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  CmsController.updateEntry
);

router.delete(
  "/entries/:entryId",
  requirePermission(PERMISSIONS.PAGE_DELETE),
  CmsController.deleteEntry
);

export default router;
