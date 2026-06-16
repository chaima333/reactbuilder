import { Router } from "express";
import { generatePage } from "./ai.controller";
import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router({ mergeParams: true });

router.post(
  "/generate-page",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  generatePage
);

export default router;