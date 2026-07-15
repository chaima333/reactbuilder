import {
  Router
} from "express";

import {
  getPublicSite
} from "./site.controller";

import {
  CmsPublicController
} from "../cms/cms.public.controller";

const router =
  Router();

// Server-rendered dynamic CMS page
router.get(
  "/html/cms/:siteId/:collectionSlug/:entrySlug",
  CmsPublicController.getPublishedEntryHtml
);

// Public site JSON
router.get(
  "/sites/:siteId",
  getPublicSite
);

export default router;