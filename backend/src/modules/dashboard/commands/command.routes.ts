// routes/command.routes.ts

import { Router, Response } from "express"; // 🔥 زدنا Response
import { CommandBus } from "../../../core/commands/command.bus";
import { authenticateJWT, AuthRequest } from "../../../shared/auth.util"; // 🔥 استوردنا AuthRequest

const router = Router();

// استعمل الـ Middleware
router.post("/command", authenticateJWT, async (req: AuthRequest, res: Response) => { // 🔥 حددنا النوع هنا
  try {
    // توّة TypeScript باش يعرف إنو req.user موجود
    const result = await CommandBus.execute({
      type: req.body.type,
      payload: req.body.payload,
      context: {
        userId: req.user!.id, // استعمل ! للتأكيد إنو موجود بعد الـ auth
        siteId: req.body.siteId
      }
    });

    res.json({ success: true, result });

  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;