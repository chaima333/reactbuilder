// cms.public.routes.ts
import { Router } from "express";
import { CmsPublicController } from "./cms.public.controller";

const router = Router({
  mergeParams: true
});


router.get(
  "/collections/:collectionSlug/entries",
  CmsPublicController.getPublishedEntries
);

router.get(
  "/collections/:collectionSlug/entries/:entrySlug",
  CmsPublicController.getPublishedEntry
);

export default router;