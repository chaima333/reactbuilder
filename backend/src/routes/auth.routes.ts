import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateProfile,
  googleAuthController,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller";
import { authenticateJWT } from "../shared/auth.util";
import { authorizeRoles } from "../core/middleware/middlewares/role.middleware";

const router = Router();

// ========== ROUTES PUBLIQUES ==========
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh_token", refreshTokenController);
router.post("/logout", logoutController);
router.put('/profile', authenticateJWT, updateProfile);

// 🔥 ROUTE GOOGLE AUTH (AJOUTER CETTE LIGNE)
router.post("/google", googleAuthController);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ========== ROUTES PROTÉGÉES ==========
router.get("/profile", authenticateJWT, async (req, res) => {
  res.json({ 
    success: true, 
    user: (req as any).user 
  });
});

// Route Admin seulement
router.get("/admin/users", 
  authenticateJWT, 
  authorizeRoles("Admin"), 
  async (req, res) => {
    res.json({ 
      success: true, 
      message: "Liste des utilisateurs (admin only)" 
    });
  }
);

// Route Admin et Editor
router.get("/dashboard", 
  authenticateJWT, 
  authorizeRoles("Admin", "Editor"), 
  async (req, res) => {
    res.json({ 
      success: true, 
      message: "Dashboard accessible aux Admins et Editors" 
    });
  }
);

export default router;