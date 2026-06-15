import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./notification.controller";

const router = Router();

router.use(authenticateJWT);

router.get(
  "/",
  getNotifications
);

router.get(
  "/unread-count",
  getUnreadCount
);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

export default router;