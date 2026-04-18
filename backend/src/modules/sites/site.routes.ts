import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { requireGlobalRole } from "../../core/middleware/globalGuard";
import { requireSiteAccess } from "../../core/middleware/siteGuard";
import { requirePermission } from "../../core/constants/requirePermission";
import { createSite, updateSite, deleteSite, getSiteById } from "./site.controller";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router();

router.use(authenticateJWT);

router.post("/", requireGlobalRole(["ADMIN", "Creator"]), createSite);


router.get("/", requireSiteAccess, requirePermission(PERMISSIONS.SITE_READ), getSiteById);


router.put("/", requireSiteAccess, requirePermission(PERMISSIONS.SITE_UPDATE), updateSite);


router.delete("/", requireSiteAccess, requirePermission(PERMISSIONS.SITE_DELETE), deleteSite);

export default router;