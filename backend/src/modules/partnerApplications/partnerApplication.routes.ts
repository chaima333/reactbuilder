import { Router } from "express";

import {
  partnerApplicationController
} from "./partnerApplication.controller";

import {
  requirePermission
} from "../../core/middleware/role.middleware";

import {
  PERMISSIONS
} from "../../core/constants/permissions";

export const publicPartnerApplicationRoutes =
  Router({
    mergeParams: true
  });

publicPartnerApplicationRoutes.post(
  "/",
  partnerApplicationController.createPublicApplication
);

const partnerApplicationRoutes =
  Router({
    mergeParams: true
  });

partnerApplicationRoutes.get(
  "/",
  requirePermission(
    PERMISSIONS.PARTNER_APPLICATION_READ
  ),
  partnerApplicationController.listApplications
);

partnerApplicationRoutes.get(
  "/:applicationId",
  requirePermission(
    PERMISSIONS.PARTNER_APPLICATION_READ
  ),
  partnerApplicationController.getApplicationById
);

partnerApplicationRoutes.patch(
  "/:applicationId/approve",
  requirePermission(
    PERMISSIONS.PARTNER_APPLICATION_REVIEW
  ),
  partnerApplicationController.approveApplication
);

partnerApplicationRoutes.patch(
  "/:applicationId/reject",
  requirePermission(
    PERMISSIONS.PARTNER_APPLICATION_REVIEW
  ),
  partnerApplicationController.rejectApplication
);

export default partnerApplicationRoutes;