import { Router } from "express";
import * as AuthController from "./auth.controller";
import { authenticateJWT } from "../../shared/auth.util";
import { authorizeRoles } from "../../core/middleware/role.middleware";

const router = Router();

router.post("/register", AuthController.registerController);
router.post("/login", AuthController.loginController);
router.post("/refresh_token", AuthController.refreshTokenController);
router.post("/logout", AuthController.logoutController);
router.post("/google", AuthController.googleAuthController);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password/:token", AuthController.resetPassword);

// Protected routes
router.get("/profile", authenticateJWT, (req: any, res) => {
    res.json({ success: true, user: req.user });
});

export default router;