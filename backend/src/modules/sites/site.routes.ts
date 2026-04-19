import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  createSite,
  updateSite,
  deleteSite,
  getSiteById,
  getSites,
  getSiteAccess
} from "./site.controller";
import { tenantResolver } from "../../core/middleware/tenant.middleware";
import { requireSiteAccess } from "../../core/middleware/siteGuard";

const router = Router();

router.use(authenticateJWT);

// GLOBAL ONLY
router.post("/", createSite);
router.get("/", getSites);

// FIX: ما تعملش route duplicate
//router.get("/current", tenantResolver, getSiteById);
router.get("/:siteId/access", getSiteAccess);
//router.put("/current", tenantResolver, updateSite);
//router.delete("/current", tenantResolver, deleteSite);
router.get("/:siteId", getSiteById);
router.put("/:siteId", updateSite);
router.delete("/:siteId", deleteSite);
export default router;