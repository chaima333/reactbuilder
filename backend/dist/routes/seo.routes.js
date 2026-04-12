"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_util_1 = require("../shared/auth.util");
const seo_controller_1 = require("../controllers/seo.controller");
const router = (0, express_1.Router)();
// Routes publiques (pas d'authentification)
router.get('/sites/:siteId/sitemap.xml', seo_controller_1.generateSitemap);
router.get('/sites/:siteId/robots.txt', seo_controller_1.getRobotsTxt);
// Routes protégées (authentification requise)
router.get('/pages/:pageId/seo', auth_util_1.authenticateJWT, seo_controller_1.getPageSeo);
router.put('/pages/:pageId/seo', auth_util_1.authenticateJWT, seo_controller_1.updatePageSeo);
exports.default = router;
