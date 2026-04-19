

import { Router } from "express";
import { getSitePlugins } from "./plugin.controller";
import { authenticateJWT } from "../../shared/auth.util"; // ناديه من البلاصة الصحيحة توّة

const router = Router();

/**
 * @route   GET /api/plugins/site/:siteId
 * @desc    Get all enabled plugins slugs for a specific site
 * @access  Private
 */
router.get("/site/:siteId", authenticateJWT, getSitePlugins);

export default router;