import { Router } from "express";
import { getPublicPage } from "../controllers/public.controller";

const router = Router();

// 🔥 PUBLIC ROUTE
router.get("/pages/:siteId/:slug", getPublicPage);

export default router;