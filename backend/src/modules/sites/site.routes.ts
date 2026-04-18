import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";
import {
  createSite,
  updateSite,
  deleteSite,
  getSiteById,
  getSites
} from "./site.controller";
import { authorizeRoles } from "../../core/middleware/role.middleware";

const router = Router();

router.use(authenticateJWT);

// 👇 any logged user
router.get("/", getSites);
router.get("/:id", getSiteById);

// 👇 restricted actions
router.post("/", authorizeRoles("ADMIN", "EDITOR"), createSite);
router.put("/:id", authorizeRoles("ADMIN", "EDITOR"), updateSite);
router.delete("/:id", authorizeRoles("ADMIN"), deleteSite);

export default router;