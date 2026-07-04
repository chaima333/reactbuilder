import { Router } from "express";

import { requirePermission } from "../../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../../core/constants/permissions";

import {
  getPages,
  createPage,
  updatePage,
  deletePage,
  publishPageController,
  restorePageVersion,
  getPageHistory,
  getPageById,
  updatePageSeo
} from "../controllers/page.controller";

import {
  getFigmaRawImport,
  importFigmaRaw
} from "../controllers/figmaImport.controller";

const router = Router({ mergeParams: true });

// =========================
// FIGMA IMPORT
// =========================

router.post(
  "/figma/import/raw",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  importFigmaRaw
);

router.get(
  "/figma/import/raw/:importId",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  getFigmaRawImport
);

// =========================
// PAGES CRUD
// =========================

router.get(
  "/",
  requirePermission(PERMISSIONS.PAGE_READ),
  getPages
);

router.post(
  "/",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  createPage
);
router.put(
  "/:pageId/seo",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  updatePageSeo
);
router.get(
  "/:pageId",
  requirePermission(PERMISSIONS.PAGE_READ),
  getPageById
);

router.put(
  "/:pageId",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  updatePage
);

router.delete(
  "/:pageId",
  requirePermission(PERMISSIONS.PAGE_DELETE),
  deletePage
);

// =========================
// LIFECYCLE
// =========================

router.post(
  "/:pageId/publish",
  requirePermission(PERMISSIONS.PAGE_PUBLISH),
  publishPageController
);

// =========================
// VERSIONING
// =========================

router.get(
  "/:pageId/versions",
  requirePermission(PERMISSIONS.PAGE_READ),
  getPageHistory
);

router.post(
  "/:pageId/restore/:versionId",
  requirePermission(PERMISSIONS.PAGE_RESTORE),
  restorePageVersion
);

export default router;