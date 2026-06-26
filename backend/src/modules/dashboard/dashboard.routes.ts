import { Router } from "express";

import { getDashboardFull } from "./controllers/dashboard.controller";
import { getLiveEvents } from "./controllers/monitor.controller";

import { requirePermission } from "../../core/constants/requirePermission";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router({ mergeParams: true });

router.get(
  "/full",
  requirePermission(PERMISSIONS.DASHBOARD_READ),
  getDashboardFull
);

router.get(
  "/internal/monitor/events",
  requirePermission(PERMISSIONS.SITE_UPDATE),
  getLiveEvents
);

export default router;