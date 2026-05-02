import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { getDashboardFull } from "./dashboard.controller";

const router = Router();

router.use(authenticateJWT);

// 🔥 SINGLE SOURCE OF TRUTH
router.get("/sites/:siteId/dashboard/full",getDashboardFull);
export default router;