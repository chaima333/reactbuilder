import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";

import {
  generateFigmaPluginToken,
  getFigmaPluginSites,
  importFigmaRawFromPlugin
} from "./figmaPlugin.controller";
import { requireFigmaPluginEnabled } from "./figmaPluginEnabled.middleware";

const router = Router();

router.post(
  "/token",
  authenticateJWT,
  requireFigmaPluginEnabled,
  generateFigmaPluginToken
);

router.get(
  "/sites",
  requireFigmaPluginEnabled,
  getFigmaPluginSites
);

router.post(
  "/import/raw",
  requireFigmaPluginEnabled,
  importFigmaRawFromPlugin
);

export default router;
