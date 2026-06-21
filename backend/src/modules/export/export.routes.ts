import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import { authorizeRoles } from "../../core/middleware/role.middleware";
import { exportAllData } from "./export.controller";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("ADMIN"));

router.get("/all", exportAllData);

export default router;