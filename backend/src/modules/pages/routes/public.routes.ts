import { Router } from "express";
import { getPublicPage, getPublicPageJSON } from "../controllers/public.controller"; // ثبت من اسم الكنترولر

const router = Router({ mergeParams: true }); // 👈 زيد هذي ضروري!!

router.get("/pages/:siteId/:slug", getPublicPage);
router.get("/public/pages/:siteId/:slug",getPublicPageJSON);
export default router;