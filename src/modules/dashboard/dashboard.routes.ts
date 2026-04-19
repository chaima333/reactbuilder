import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  getDashboardStats,
  getSiteStats,
  getActivityLog
} from "./dashboard.controller";
import { authorizeRoles } from "../../core/middleware/role.middleware";

const router = Router();

router.use(authenticateJWT);

// 👇 normal user routes
router.get("/stats", getDashboardStats);
router.get("/sites/:siteId/stats", getSiteStats);
router.get("/activity", getActivityLog);

// 👇 admin-only (permission, not URL)
router.get(
  "/admin/stats",
  authorizeRoles("ADMIN"),
  getDashboardStats
);

export default router;