import { Router } from "express";
import { authenticateJWT } from "../shared/auth.util";
import { authorizeSiteRoles } from "../modules/membership/membership.middleware";

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

// 🧠 IMPORTANT: create site (أي user ينجم)
router.post("/", createSite);

// 🧠 list sites → user فقط يشوف sites متاعو (نخليوها كما هي توّة)
router.get("/", getSites);

// 🔥 site-specific access (HERE SaaS starts)
router.get("/:siteId", authorizeSiteRoles("Owner", "Admin", "Editor", "Viewer"), getSiteById);

router.put("/:siteId", authorizeSiteRoles("Owner", "Admin"), updateSite);

router.delete("/:siteId", authorizeSiteRoles("Owner"), deleteSite);

export default router;