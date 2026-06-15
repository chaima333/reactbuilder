import { Router } from "express";
import { getPlatformSettings } from "./platformSettings.controller";

const router = Router();

router.get("/settings", getPlatformSettings);

export default router;
