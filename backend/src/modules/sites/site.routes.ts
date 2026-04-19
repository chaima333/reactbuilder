import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  createSite,
  updateSite,
  deleteSite,
  getSiteById,
  getSites
} from "./site.controller";
import { tenantResolver } from "../../core/middleware/tenant.middleware";
import { requireSiteAccess } from "../../core/middleware/siteGuard";

const router = Router();


router.use(authenticateJWT);

// 🔥 CREATE SITE (global)
router.post("/", createSite);

router.get("/all", getSites);


// 🔥 GET / UPDATE / DELETE (tenant)
router.get("/", tenantResolver, requireSiteAccess, getSiteById);

router.put("/", tenantResolver, requireSiteAccess, updateSite);

router.delete("/", tenantResolver, requireSiteAccess, deleteSite);

export default router;