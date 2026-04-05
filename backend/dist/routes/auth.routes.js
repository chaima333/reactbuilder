"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_util_1 = require("../shared/auth.util");
const role_middleware_1 = require("../middlewares/role.middleware");
const router = (0, express_1.Router)();
// ========== ROUTES PUBLIQUES ==========
router.post("/register", auth_controller_1.registerController);
router.post("/login", auth_controller_1.loginController);
router.post("/refresh_token", auth_controller_1.refreshTokenController);
router.post("/logout", auth_controller_1.logoutController);
router.put('/profile', auth_util_1.authenticateJWT, auth_controller_1.updateProfile);
// ========== ROUTES PROTÉGÉES ==========
router.get("/profile", auth_util_1.authenticateJWT, async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});
// Route Admin seulement
router.get("/admin/users", auth_util_1.authenticateJWT, (0, role_middleware_1.authorizeRoles)("Admin"), async (req, res) => {
    res.json({
        success: true,
        message: "Liste des utilisateurs (admin only)"
    });
});
// Route Admin et Editor
router.get("/dashboard", auth_util_1.authenticateJWT, (0, role_middleware_1.authorizeRoles)("Admin", "Editor"), async (req, res) => {
    res.json({
        success: true,
        message: "Dashboard accessible aux Admins et Editors"
    });
});
exports.default = router;
