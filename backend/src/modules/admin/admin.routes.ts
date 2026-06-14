import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAdminStats,
  getAdminUsers,
  getAdminSites,
  getAdminPlugins,
  getAdminActivityLogs,
} from "./admin.controller";
import { authorizeRoles } from "../../core/middleware/role.middleware";
import { getAdminSettings, updateAdminSettings } from "./adminSettings.controller";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("ADMIN"));

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/sites", getAdminSites);
router.get("/plugins", getAdminPlugins);
router.get("/activity-logs", getAdminActivityLogs);

router.get("/pending-users", getPendingUsers);
router.post("/approve-user/:id", approveUser);
router.delete("/reject-user/:id", rejectUser);

router.get(
  "/settings",
  getAdminSettings
);

router.put(
  "/settings",
  updateAdminSettings
);

export default router;