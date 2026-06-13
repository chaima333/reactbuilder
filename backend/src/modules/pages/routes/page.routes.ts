import { Router } from "express";
import { authenticateJWT } from "../../../shared/auth.util";
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
  getPageById
} from "../controllers/page.controller";
import { getFigmaRawImport, importFigma, importFigmaRaw } from "../controllers/figmaImport.controller";

const router = Router({ mergeParams: true });


router.use(authenticateJWT);

router.get("/", requirePermission(PERMISSIONS.SITE_READ), getPages);
router.post("/", requirePermission(PERMISSIONS.PAGE_CREATE), createPage);
router.put("/:pageId", requirePermission(PERMISSIONS.PAGE_UPDATE), updatePage);
router.delete("/:pageId", requirePermission(PERMISSIONS.PAGE_DELETE), deletePage);
router.get("/:pageId", requirePermission(PERMISSIONS.SITE_READ), getPageById);
// lifecycle
router.post("/:pageId/publish", requirePermission(PERMISSIONS.PAGE_UPDATE), publishPageController);

//  versioning
router.get("/:pageId/versions", requirePermission(PERMISSIONS.PAGE_UPDATE), getPageHistory);
router.post("/:pageId/restore/:versionId", requirePermission(PERMISSIONS.PAGE_UPDATE), restorePageVersion);

// figma import
router.post(
  "/figma/import/raw",
  importFigmaRaw
);

router.get(
  "/figma/import/raw/:importId",
  getFigmaRawImport
);
export default router;