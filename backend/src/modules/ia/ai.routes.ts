import { Router } from "express";
import { designCopilotApply, designCopilotChat, generatePage, getHistory } from "./ai.controller";
import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router({ mergeParams: true });

router.post(
  "/generate-page",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  generatePage
);
router.get(
  "/history",
  getHistory
);
router.post(
  "/design-copilot/chat",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  designCopilotChat
);

router.post(
  "/design-copilot/apply",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  designCopilotApply
);
export default router;