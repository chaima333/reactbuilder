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
  getAIStats,
} from "./admin.controller";
import { authorizeRoles } from "../../core/middleware/role.middleware";
import {
  generateAdminApiKey,
  getAdminAiSettings,
  getAdminSettings,
  testAdminWebhook,
  updateAdminAiSettings,
  updateAdminSettings
} from "./adminSettings.controller";
import {
  AdminHelpController
} from "./adminHelp.controller";

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

router.get(
  "/settings/ai",
  getAdminAiSettings
);

router.put(
  "/settings/ai",
  updateAdminAiSettings
);

router.post(
  "/settings/generate-api-key",
  generateAdminApiKey
);
router.post(
  "/settings/test-webhook",
  testAdminWebhook
);
router.get("/ai-stats", getAIStats);

router.get(
  "/help/categories",
  AdminHelpController.listCategories
);
router.post(
  "/help/categories",
  AdminHelpController.createCategory
);
router.put(
  "/help/categories/:id",
  AdminHelpController.updateCategory
);
router.delete(
  "/help/categories/:id",
  AdminHelpController.deleteCategory
);
router.get(
  "/help/articles",
  AdminHelpController.listArticles
);
router.post(
  "/help/articles",
  AdminHelpController.createArticle
);
router.put(
  "/help/articles/:id",
  AdminHelpController.updateArticle
);
router.delete(
  "/help/articles/:id",
  AdminHelpController.deleteArticle
);
export default router;
