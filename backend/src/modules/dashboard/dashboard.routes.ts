import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { getDashboardFull } from "./controllers/dashboard.controller";
import { getLiveEvents } from "./controllers/monitor.controller";

const router = Router({ mergeParams: true });

router.use(authenticateJWT);

// ✅ dashboard (clean)
router.get("/full", getDashboardFull);

// 🔥 monitoring (separate)
router.get("/internal/monitor/events", getLiveEvents);

export default router;