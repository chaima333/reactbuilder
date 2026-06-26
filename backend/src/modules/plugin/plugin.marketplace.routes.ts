import { Router } from "express";

import {
  getMarketplace,
  installPlugin,
  enablePlugin,
  disablePlugin,
  uninstallPlugin,
} from "./plugin.marketplace.controller";

import { requirePermission } from "../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../core/constants/permissions";

const router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(PERMISSIONS.PLUGIN_READ),
  getMarketplace
);

router.post(
  "/:pluginId/install",
  requirePermission(PERMISSIONS.PLUGIN_INSTALL),
  installPlugin
);

router.patch(
  "/:pluginId/enable",
  requirePermission(PERMISSIONS.PLUGIN_ENABLE),
  enablePlugin
);

router.patch(
  "/:pluginId/disable",
  requirePermission(PERMISSIONS.PLUGIN_DISABLE),
  disablePlugin
);

router.delete(
  "/:pluginId/uninstall",
  requirePermission(PERMISSIONS.PLUGIN_UNINSTALL),
  uninstallPlugin
);

export default router;