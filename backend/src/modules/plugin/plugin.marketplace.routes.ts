import { Router } from "express";

import {
  getMarketplace,
  installPlugin,
  enablePlugin,
  disablePlugin,
  uninstallPlugin,
} from "./plugin.marketplace.controller";

const router = Router();

router.get("/", getMarketplace);

router.post("/:pluginId/install", installPlugin);

router.patch("/:pluginId/enable", enablePlugin);

router.patch("/:pluginId/disable", disablePlugin);

router.delete("/:pluginId/uninstall", uninstallPlugin);

export default router;