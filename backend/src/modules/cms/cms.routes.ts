import {
  Router
} from "express";

import {
  CmsController
} from "./cms.controller";

const router =
  Router({
    mergeParams: true
  });

router.get(
  "/collections",
  CmsController.getCollections
);

router.post(
  "/collections",
  CmsController.createCollection
);

router.get(
  "/collections/:collectionId",
  CmsController.getCollectionById
);

router.put(
  "/collections/:collectionId",
  CmsController.updateCollection
);

router.delete(
  "/collections/:collectionId",
  CmsController.deleteCollection
);
router.get(
  "/collections/:collectionId/fields",
  CmsController.getFields
);

router.post(
  "/collections/:collectionId/fields",
  CmsController.createField
);

router.put(
  "/fields/:fieldId",
  CmsController.updateField
);

router.delete(
  "/fields/:fieldId",
  CmsController.deleteField
);

router.get(
  "/collections/:collectionSlug/entries",
  CmsController.getEntries
);

router.post(
  "/collections/:collectionId/entries",
  CmsController.createEntry
);

router.get(
  "/entries/:entryId",
  CmsController.getEntryById
);

router.put(
  "/entries/:entryId",
  CmsController.updateEntry
);

router.delete(
  "/entries/:entryId",
  CmsController.deleteEntry
);

export default router;