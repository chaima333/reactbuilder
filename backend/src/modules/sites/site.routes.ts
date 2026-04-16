import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { requireSiteRole } from "../membership/membership.middleware"; // تأكد من المسار الصحيح للميدل-وير الجديد


import {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  deleteSite
} from "./site.controller";

const router = Router();

// auth global
router.use(authenticateJWT);

// Create site
router.post("/", createSite);

// List sites
router.get("/", getSites);

// 🔥 تطبيق الـ SaaS Logic الجديد
// استعملنا checkSiteAccess وبدلنا الـ Roles لـ OWNER, ADMIN... (Uppercase)
router.get("/:siteId", requireSiteRole(["OWNER", "ADMIN", "EDITOR", "VIEWER"]), getSiteById);

router.put("/:siteId", requireSiteRole(["OWNER", "ADMIN"]), updateSite);

router.delete("/:siteId", requireSiteRole(["OWNER"]), deleteSite);

export default router;