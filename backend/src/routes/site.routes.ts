import { Router } from "express";
import { authenticateJWT } from "../shared/auth.util";
// 👇 جيب الـ Middleware الجديد بالاسم الصحيح
import { checkSiteAccess } from "../modules/membership/membership.middleware"; 

import {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  deleteSite
} from "../controllers/site.controller";

const router = Router();

// auth global
router.use(authenticateJWT);

// Create site
router.post("/", createSite);

// List sites
router.get("/", getSites);

// 🔥 تطبيق الـ SaaS Logic الجديد
// استعملنا checkSiteAccess وبدلنا الـ Roles لـ OWNER, ADMIN... (Uppercase)
router.get("/:siteId", checkSiteAccess(["OWNER", "ADMIN", "EDITOR", "VIEWER"]), getSiteById);

router.put("/:siteId", checkSiteAccess(["OWNER", "ADMIN"]), updateSite);

router.delete("/:siteId", checkSiteAccess(["OWNER"]), deleteSite);

export default router;