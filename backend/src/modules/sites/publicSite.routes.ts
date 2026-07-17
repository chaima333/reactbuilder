import {
  Router
} from "express";

import {
  getPublicSite
} from "./site.controller";

import {
  CmsPublicController
} from "../cms/cms.public.controller";

import {
  attachOptionalSiteVisitorAuth
} from "../siteVisitors/siteVisitorAuth.middleware";

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
  attachOptionalSiteVisitorAuth,
  getPublicSite
);

export default router;