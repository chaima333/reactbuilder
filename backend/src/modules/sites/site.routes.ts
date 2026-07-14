import { Router } from "express";

import {
  createSite,
  updateSite,
  updateGlobalLayout,
  deleteSite,
  getSiteById,
  getSites,
  getSiteAccess,
  getDefaultSite,
  updateSiteTheme
} from "./site.controller";

import { tenantResolver } from "../../core/middleware/tenantResolver";
import { requireSiteAccess } from "../../core/middleware/siteGuard";
import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";
import siteMembersRoutes from "./members/siteMembers.routes";
import { exportSite } from "./export/export.controller";

const router = Router({ mergeParams: true });

const siteAccessStack = [
  tenantResolver,
  requireSiteAccess
];

// GLOBAL ROUTES
router.post("/", createSite);
router.get("/", getSites);

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
router.put(
  "/:siteId/theme",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_UPDATE),
  updateSiteTheme
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

router.get(
  "/:siteId/export",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_UPDATE),
  exportSite
);

export default router;
