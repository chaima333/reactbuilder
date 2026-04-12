"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_util_1 = require("../shared/auth.util");
const page_controller_1 = require("../controllers/page.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_util_1.authenticateJWT);
// Routes pour les pages
router.get('/:siteId/pages', page_controller_1.getPages);
router.get('/:siteId/pages/:pageId', page_controller_1.getPageById);
router.post('/:siteId/pages', page_controller_1.createPage);
router.put('/:siteId/pages/:pageId', page_controller_1.updatePage);
router.delete('/:siteId/pages/:pageId', page_controller_1.deletePage);
exports.default = router;
