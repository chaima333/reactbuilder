import { Router } from "express";
import { authenticateJWT } from "../shared/auth.util";
import { authorizeRoles } from "../core/middleware/middlewares/role.middleware";
import {
  getDashboardStats,
  getSiteStats,
  getActivityLog
} from "../controllers/dashboard.controller";

const router = Router();

// Toutes les routes dashboard nécessitent une authentification
router.use(authenticateJWT);

// Routes dashboard
router.get("/stats", getDashboardStats);
router.get("/sites/:siteId/stats", getSiteStats);
router.get("/activity", getActivityLog);

// Routes admin uniquement (si nécessaire)
router.get("/admin/stats", 
  authenticateJWT, 
  authorizeRoles("Admin"), 
  getDashboardStats
);

export default router;