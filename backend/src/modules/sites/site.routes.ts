import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { requireGlobalRole } from "../../core/middleware/globalGuard";
import { requireSiteAccess } from "../../core/middleware/siteGuard";
import { requirePermission } from "../../core/constants/requirePermission";
import { createSite, updateSite, deleteSite, getSiteById } from "./site.controller";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router();

router.use(authenticateJWT);

// 1. Create Site (Global Guard)
router.post("/", requireGlobalRole(["Admin", "Creator"]), createSite);

// 2. Get Site (Permission: SITE_READ)
router.get("/:siteId", requireSiteAccess, requirePermission(PERMISSIONS.SITE_READ), getSiteById);

// 3. Update Site (Permission: SITE_UPDATE)
router.put("/:siteId", requireSiteAccess, requirePermission(PERMISSIONS.SITE_UPDATE), updateSite);

// 4. Delete Site (Permission: SITE_DELETE)
router.delete("/:siteId", requireSiteAccess, requirePermission(PERMISSIONS.SITE_DELETE), deleteSite);

export default router;