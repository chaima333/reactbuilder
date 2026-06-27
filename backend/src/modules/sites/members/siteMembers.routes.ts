// backend/src/modules/sites/members/siteMembers.routes.ts

import {
  Router
} from "express";

import {
  listSiteMembers,
  addSiteMember,
  updateSiteMemberRole,
  removeSiteMember
} from "./siteMembers.controller";

import {
  requirePermission
} from "../../../core/middleware/role.middleware";

import {
  PERMISSIONS
} from "../../../core/constants/permissions";

const router =
  Router({
    mergeParams: true
  });

router.get(
  "/",
  requirePermission(PERMISSIONS.MEMBER_READ),
  listSiteMembers
);

router.post(
  "/",
  requirePermission(PERMISSIONS.MEMBER_INVITE),
  addSiteMember
);

router.patch(
  "/:userId/role",
  requirePermission(PERMISSIONS.MEMBER_UPDATE_ROLE),
  updateSiteMemberRole
);

router.delete(
  "/:userId",
  requirePermission(PERMISSIONS.MEMBER_REMOVE),
  removeSiteMember
);

export default router;