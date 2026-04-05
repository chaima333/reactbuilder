"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_util_1 = require("../shared/auth.util");
const site_controller_1 = require("../controllers/site.controller");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_util_1.authenticateJWT);
router.post('/', site_controller_1.createSite);
router.get('/', site_controller_1.getSites);
router.get('/:id', site_controller_1.getSiteById);
router.put('/:id', site_controller_1.updateSite);
router.delete('/:id', site_controller_1.deleteSite);
exports.default = router;
