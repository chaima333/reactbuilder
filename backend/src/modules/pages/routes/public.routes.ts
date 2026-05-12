// modules/pages/routes/public.routes.ts
import { Router } from "express";
import { getPublicPage, getPublicPageJSON } from "../controllers/public.controller"; // ثبت من اسم الكنترولر

const router = Router({ mergeParams: true }); // 👈 زيد هذي ضروري!!

// جرب بدّل الـ Route هكا باش نقطعو الشك
router.get("/pages/:siteId/:slug", getPublicPage);
router.get( "/api/public/pages/:siteId/:slug",getPublicPageJSON);
export default router;