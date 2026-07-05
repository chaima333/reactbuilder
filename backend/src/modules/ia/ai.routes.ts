import { Router } from "express";

import {
  designCopilotApply,
  designCopilotChat,
  generatePage,
  getActivityHistory,
  getAiAnalytics,
  getHistory,
  submitAiFeedback
} from "./ai.controller";

import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";
import { editSelectedBlock } from "./assistant/assistant.controller";
import { enforceAiPayloadLimit } from "./aiRequestLimits.middleware";

const router = Router({
  mergeParams: true
});

router.use(enforceAiPayloadLimit);

router.post(
  "/generate-page",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  requirePermission(PERMISSIONS.PAGE_PUBLISH),
  generatePage
);

router.get(
  "/history",
  requirePermission(PERMISSIONS.PAGE_READ),
  getHistory
);

router.get(
  "/activity-history",
  requirePermission(PERMISSIONS.PAGE_READ),
  getActivityHistory
);

router.get(
  "/analytics",
  requirePermission(PERMISSIONS.PAGE_READ),
  getAiAnalytics
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
router.post(
  "/feedback",
  requirePermission(PERMISSIONS.PAGE_READ),
  submitAiFeedback
);
router.post(
  "/assistant/edit-block",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  editSelectedBlock
);

export default router;