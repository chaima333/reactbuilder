import { Router } from "express";

import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";
import {
  createPattern,
  deletePattern,
  getPattern,
  listPatterns,
  updatePattern
} from "./blockPattern.controller";

const router =
  Router({
    mergeParams: true
  });

router.get(
  "/",
  requirePermission(PERMISSIONS.PAGE_READ),
  listPatterns
);

router.post(
  "/",
  requirePermission(PERMISSIONS.PAGE_CREATE),
  createPattern
);

router.get(
  "/:patternId",
  requirePermission(PERMISSIONS.PAGE_READ),
  getPattern
);

router.put(
  "/:patternId",
  requirePermission(PERMISSIONS.PAGE_UPDATE),
  updatePattern
);

router.delete(
  "/:patternId",
  requirePermission(PERMISSIONS.PAGE_DELETE),
  deletePattern
);

export default router;
