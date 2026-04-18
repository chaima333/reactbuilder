import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole
} from "./user.controller";
import { authorizeRoles } from "../../core/middleware/role.middleware";

const router = Router();

router.use(authenticateJWT);

// 🔐 admin only
router.get("/", authorizeRoles("ADMIN"), getUsers);
router.get("/:id", authorizeRoles("ADMIN"), getUserById);
router.post("/", authorizeRoles("ADMIN"), createUser);
router.put("/:id", authorizeRoles("ADMIN"), updateUser);
router.delete("/:id", authorizeRoles("ADMIN"), deleteUser);
router.patch("/:id/role", authorizeRoles("ADMIN"), changeUserRole);

export default router;