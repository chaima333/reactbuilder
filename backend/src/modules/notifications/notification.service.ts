import Notification from "../../models/Notification";

export class NotificationService {
  static async create(data: {
    userId: number;
    siteId?: number | null;
    type: string;
    title: string;
    message?: string;
    metadata?: any;
  }) {
    return Notification.create({
      userId: data.userId,
      siteId: data.siteId ?? null,
      type: data.type,
      title: data.title,
      message: data.message ?? null,
      metadata: data.metadata ?? {},
    });
  }

  static async getUserNotifications(userId: number) {
    return Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  static async getUnreadCount(userId: number) {
    return Notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  static async markAsRead(id: number, userId: number) {
    await Notification.update(
      { isRead: true },
      {
        where: {
          id,
          userId,
        },
      }
    );
  }

  static async markAllAsRead(userId: number) {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
        },
      }
    );
  }
}