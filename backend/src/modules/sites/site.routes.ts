import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { requireGlobalRole } from "../../core/middleware/globalGuard";
import { requireSiteAccess } from "../../core/middleware/siteGuard";
import { requirePermission } from "../../core/constants/requirePermission";
import { createSite, updateSite, deleteSite, getSiteById } from "./site.controller";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router();

router.use(authenticateJWT);

// 1. Create Site (Global Guard) - تبقى كيف ما هي
router.post("/", requireGlobalRole(["Admin", "Creator"]), createSite);

// 2. Get Site - (نحينا :siteId)
// توّة يولي الرابط: GET /api/sites/
router.get("/", requireSiteAccess, requirePermission(PERMISSIONS.SITE_READ), getSiteById);

// 3. Update Site - (نحينا :siteId)
// توّة يولي الرابط: PUT /api/sites/
router.put("/", requireSiteAccess, requirePermission(PERMISSIONS.SITE_UPDATE), updateSite);

// 4. Delete Site - (نحينا :siteId)
// توّة يولي الرابط: DELETE /api/sites/
router.delete("/", requireSiteAccess, requirePermission(PERMISSIONS.SITE_DELETE), deleteSite);

export default router;