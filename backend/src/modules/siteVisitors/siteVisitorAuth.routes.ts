import { Router } from "express";

import {
  getCurrentSiteVisitorController,
  loginSiteVisitorController,
  logoutSiteVisitorController,
  refreshSiteVisitorController,
  registerSiteVisitorController
} from "./siteVisitorAuth.controller";

import {
  requireSiteVisitorAuth
} from "./siteVisitorAuth.middleware";
import { visitorLoginLimiter, visitorRefreshLimiter, visitorRegisterLimiter } from "./siteVisitorAuth.rateLimit";

const router = Router({
  mergeParams: true
});

router.post(
  "/register",
  visitorRegisterLimiter,
  registerSiteVisitorController
);

router.post(
  "/login",
  visitorLoginLimiter,
  loginSiteVisitorController
);

router.post(
  "/refresh",
  visitorRefreshLimiter,
  refreshSiteVisitorController
);

router.post(
  "/logout",
  logoutSiteVisitorController
);

router.get(
  "/me",
  requireSiteVisitorAuth,
  getCurrentSiteVisitorController
);

export default router;