import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  createSite,
  updateSite,
  deleteSite,
  getSiteById,
  getSites,
  getSiteAccess,
  getDefaultSite
} from "./site.controller";

const router = Router();

router.use(authenticateJWT);

// GLOBAL ONLY
router.post("/", createSite);
router.get("/", getSites);

router.get("/:siteId/access", getSiteAccess);
router.get("/:siteId", getSiteById);
router.put("/:siteId", updateSite);
router.delete("/:siteId", deleteSite);
router.get("/default", authenticateJWT, getDefaultSite);
export default router;