import { Router } from "express";

import {
  createSite,
  updateSite,
  updateGlobalLayout,
  deleteSite,
  getSiteById,
  getSites,
  getSiteAccess,
  getDefaultSite
} from "./site.controller";

import { tenantResolver } from "../../core/middleware/tenantResolver";
import { requireSiteAccess } from "../../core/middleware/siteGuard";
import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";
import siteMembersRoutes from "./members/siteMembers.routes";

const router = Router({ mergeParams: true });

const siteAccessStack = [
  tenantResolver,
  requireSiteAccess
];

// GLOBAL ROUTES
router.post("/", createSite);
router.get("/", getSites);

// مهم: لازم قبل /:siteId
router.get("/default", getDefaultSite);

// SITE ACCESS
router.get(
  "/:siteId/access",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_READ),
  getSiteAccess
);

router.get(
  "/:siteId",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_READ),
  getSiteById
);

router.put(
  "/:siteId",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_UPDATE),
  updateSite
);

router.put(
  "/:siteId/global-layout",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_UPDATE),
  updateGlobalLayout
);

router.delete(
  "/:siteId",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_DELETE),
  deleteSite
);
router.use(
  "/:siteId/members",
  siteAccessStack,
  siteMembersRoutes
);
export default router;