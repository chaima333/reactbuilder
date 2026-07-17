import { Router } from "express";
import {
  getPublicPage,
  getPublicPageJSON
} from "../controllers/public.controller";
import { attachOptionalSiteVisitorAuth } from "../../siteVisitors/siteVisitorAuth.middleware";

const router = Router({
  mergeParams: true
});

router.get(
  "/html/pages/:siteId/:slug",
  attachOptionalSiteVisitorAuth,
  getPublicPage
);

router.get(
  "/pages/:siteId/:slug",
  attachOptionalSiteVisitorAuth,
  getPublicPageJSON
);

router.get(
  "/public/pages/:siteId/:slug",
  attachOptionalSiteVisitorAuth,
  getPublicPageJSON
);

export default router;