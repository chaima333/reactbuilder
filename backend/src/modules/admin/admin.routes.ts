import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  getPendingUsers,
  approveUser,
  rejectUser
} from "./admin.controller";
import { authorizeRoles } from "../../core/middleware/role.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("ADMIN"));

router.get("/pending-users", getPendingUsers);
router.post("/approve-user/:id", approveUser);
router.delete("/reject-user/:id", rejectUser);

export default router;