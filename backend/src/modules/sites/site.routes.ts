import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
// استيراد الحراس (Guards)
import { requireGlobalRole } from "../../core/middleware/globalGuard"; 
import { requireSiteAccess, requireTenantRole } from "../../core/middleware/siteGuard";

import {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  deleteSite
} from "./site.controller";

const router = Router();


router.use(authenticateJWT);



router.post(
  '/', 
  requireGlobalRole(['Admin', 'Creator']), 
  createSite
);

router.get("/", getSites);



router.get(
  "/:siteId", 
  requireSiteAccess, 
  getSiteById
);

router.put(
  "/:siteId", 
  requireSiteAccess, 
  requireTenantRole(["OWNER", "ADMIN"]), 
  updateSite
);

router.delete(
  "/:siteId", 
  requireSiteAccess, 
  requireTenantRole(["OWNER"]), 
  deleteSite
);

export default router;