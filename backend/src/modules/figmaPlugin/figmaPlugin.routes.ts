import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";

import {
  generateFigmaPluginToken,
  getFigmaPluginSites,
  importFigmaRawFromPlugin
} from "./figmaPlugin.controller";

const router = Router();

router.post(
  "/token",
  authenticateJWT,
  generateFigmaPluginToken
);

router.get(
  "/sites",
  getFigmaPluginSites
);

router.post(
  "/import/raw",
  importFigmaRawFromPlugin
);

export default router;