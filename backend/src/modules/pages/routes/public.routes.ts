import { Router } from "express";
import {
  getPublicPage,
  getPublicPageJSON
} from "../controllers/public.controller";

const router = Router({
  mergeParams: true
});

// HTML rendered page for SEO / view-source
router.get(
  "/html/pages/:siteId/:slug",
  getPublicPage
);

// JSON page data for React public runtime
router.get(
  "/pages/:siteId/:slug",
  getPublicPageJSON
);

// Legacy JSON route
router.get(
  "/public/pages/:siteId/:slug",
  getPublicPageJSON
);

export default router;