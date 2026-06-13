import { Router } from "express";
import { authenticateJWT, AuthRequest } from "../../../shared/auth.util";
import { CommandBus } from "../../../core/commands/command.bus";

const router = Router({ mergeParams: true });

router.post("/", authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { siteId } = req.params;

    const result = await CommandBus.execute({
      type: req.body.type,
      payload: req.body.payload,
      context: {
        userId: req.user!.id,
        siteId: Number(siteId),
      },
    });

    return res.json({ success: true, result });

  } catch (e: any) {
    return res.status(400).json({ success: false, message: e.message });
  }
});

export default router;