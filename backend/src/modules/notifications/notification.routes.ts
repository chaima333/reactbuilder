import { Router } from "express";
import { authenticateJWT } from "../../shared/auth.util";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
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
router.delete("/:id", deleteNotification);
router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

export default router;