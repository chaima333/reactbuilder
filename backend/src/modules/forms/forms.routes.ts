import {
  Router
} from "express";

import {
  FormsController
} from "./forms.controller";

import {
  tenantResolver
} from "../../core/middleware/tenantResolver";

import {
  requireSiteAccess
} from "../../core/middleware/siteGuard";

import {
  requirePermission
} from "../../core/middleware/role.middleware";

import {
  PERMISSIONS
} from "../../core/constants/permissions";

const router =
  Router({
    mergeParams: true
  });

const siteAccessStack = [
  tenantResolver,
  requireSiteAccess
];

router.get(
  "/",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_READ
  ),
  FormsController.getForms
);

router.post(
  "/",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_UPDATE
  ),
  FormsController.createForm
);

router.get(
  "/slug/:slug",
  siteAccessStack,
  requirePermission(PERMISSIONS.SITE_READ),
  FormsController.getFormBySlug
);

router.get(
  "/:formId",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_READ
  ),
  FormsController.getFormById
);

router.put(
  "/:formId",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_UPDATE
  ),
  FormsController.updateForm
);

router.delete(
  "/:formId",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_UPDATE
  ),
  FormsController.deleteForm
);

router.get(
  "/:formId/submissions",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_READ
  ),
  FormsController.getSubmissions
);
router.patch(
  "/:formId/submissions/:submissionId",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_UPDATE
  ),
  FormsController.updateSubmissionStatus
);

router.delete(
  "/:formId/submissions/:submissionId",
  siteAccessStack,
  requirePermission(
    PERMISSIONS.SITE_UPDATE
  ),
  FormsController.deleteSubmission
);

export default router;
