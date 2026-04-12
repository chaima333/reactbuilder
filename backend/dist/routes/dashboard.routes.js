"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_util_1 = require("../shared/auth.util");
const role_middleware_1 = require("../middlewares/role.middleware");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = (0, express_1.Router)();
// Toutes les routes dashboard nécessitent une authentification
router.use(auth_util_1.authenticateJWT);
// Routes dashboard
router.get("/stats", dashboard_controller_1.getDashboardStats);
router.get("/sites/:siteId/stats", dashboard_controller_1.getSiteStats);
router.get("/activity", dashboard_controller_1.getActivityLog);
// Routes admin uniquement (si nécessaire)
router.get("/admin/stats", auth_util_1.authenticateJWT, (0, role_middleware_1.authorizeRoles)("Admin"), dashboard_controller_1.getDashboardStats);
exports.default = router;
