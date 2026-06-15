import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { NotificationService } from "./notification.service";

export const getNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  const notifications =
    await NotificationService.getUserNotifications(
      req.user.id
    );

  return res.json({
    success: true,
    data: notifications,
  });
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
) => {
  const count =
    await NotificationService.getUnreadCount(
      req.user.id
    );

  return res.json({
    success: true,
    data: { count },
  });
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  await NotificationService.markAsRead(
    Number(req.params.id),
    req.user.id
  );

  return res.json({
    success: true,
  });
};

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response
) => {
  await NotificationService.markAllAsRead(
    req.user.id
  );

  return res.json({
    success: true,
  });
};