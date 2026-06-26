import { Router } from "express";
import { AuthRequest } from "../../../shared/auth.util";

import { CommandBus } from "../../../core/commands/command.bus";
import { requirePermission } from "../../../core/middleware/role.middleware";
import { PERMISSIONS } from "../../../core/constants/permissions";

const router = Router({ mergeParams: true });

router.post(
  "/",
  requirePermission(PERMISSIONS.SITE_UPDATE),
  async (req: AuthRequest, res) => {
    try {
      const siteId =
        req.siteContext?.siteId;

      if (!siteId) {
        return res.status(403).json({
          success: false,
          message: "Site context missing"
        });
      }

      const result = await CommandBus.execute({
        type: req.body.type,
        payload: req.body.payload,
        context: {
          userId: req.user!.id,
          siteId: Number(siteId),
        },
      });

      return res.json({
        success: true,
        result
      });

    } catch (e: any) {
      return res.status(400).json({
        success: false,
        message: e.message
      });
    }
  }
);

export default router;