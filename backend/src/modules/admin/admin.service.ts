import {
  User,
  ActivityLog,
  Site,
  Page,
  Plugin,
} from "../../models";

import { Op } from "sequelize";

export const fetchPendingUsers = async (adminId: number) => {
  return await User.findAll({
    where: {
      isApproved: false,
      id: { [Op.not]: adminId },
    },
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
};

export const approveUserById = async (userId: number, adminId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("Utilisateur non trouvé");

  await user.update({ isApproved: true });

  await ActivityLog.create({
    userId: adminId,
    action: "user_approved",
    entityType: "user",
    entityId: user.id,
    details: { name: user.name, email: user.email },
  } as any);

  return user;
};

export const deleteUserById = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("Utilisateur non trouvé");

  await user.destroy();
  return true;
};

export const getPlatformStats = async (days = 7) => {
  const safeDays = Math.max(1, Number(days) || 7);

  const [
    totalUsers,
    pendingUsers,
    totalSites,
    totalPages,
    totalPlugins,
    totalActivities,
    publishedPages,
    activeSites,
    aiStats,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { isApproved: false } }),
    Site.count(),
    Page.count(),
    (Plugin as any).count(),
    ActivityLog.count(),
    Page.count({ where: { status: "published" } }),
    Site.count({ where: { status: "active" } }),
    AdminAnalyticsService.getAiStats(safeDays),
  ]);

  const aiAdoptionRate =
    totalPages > 0
      ? Number(((aiStats.generatedPages / totalPages) * 100).toFixed(1))
      : 0;

  return {
    totalUsers,
    pendingUsers,
    totalSites,
    totalPages,
    totalPlugins,
    totalActivityLogs: totalActivities,
    publishedPages,
    activeSites,
    aiStats,
    aiAdoptionRate,
  };
};

export const fetchAdminUsers = async () => {
  return await User.findAll({
    attributes: { exclude: ["password"] },
    order: [["createdAt", "DESC"]],
  });
};

export const fetchAdminSites = async () => {
  return await Site.findAll({
    order: [["createdAt", "DESC"]],
  });
};

export const fetchAdminPlugins = async () => {
  return await (Plugin as any).findAll({
    order: [["createdAt", "DESC"]],
  });
};

export const fetchAdminActivityLogs = async () => {
  return await ActivityLog.findAll({
    limit: 50,
    order: [["createdAt", "DESC"]],
  });
};

export class AdminAnalyticsService {
  static async getAiStats(days = 7) {
    const safeDays = Math.max(1, Number(days) || 7);

    const generatedPages = await ActivityLog.count({
      where: { action: "ai_page_generated" },
    });

    const generatedImages = await ActivityLog.count({
      where: { action: "media_ai_uploaded" },
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const generatedToday = await ActivityLog.count({
      where: {
        action: "ai_page_generated",
        createdAt: {
          [Op.gte]: startOfDay,
        },
      },
    });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);

    const generatedThisWeek = await ActivityLog.count({
      where: {
        action: "ai_page_generated",
        createdAt: {
          [Op.gte]: startOfWeek,
        },
      },
    });

    const lastGeneration = await ActivityLog.findOne({
      where: { action: "ai_page_generated" },
      order: [["createdAt", "DESC"]],
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (safeDays - 1));
    startDate.setHours(0, 0, 0, 0);

    const logs = await ActivityLog.findAll({
      where: {
        action: "ai_page_generated",
        createdAt: {
          [Op.gte]: startDate,
        },
      },
      order: [["createdAt", "ASC"]],
    });

    const dailyMap: Record<string, number> = {};
    const categoryMap: Record<string, number> = {};
    const siteMap: Record<string, number> = {};

    logs.forEach((log: any) => {
      const date = new Date(log.createdAt).toISOString().slice(0, 10);
      dailyMap[date] = (dailyMap[date] || 0) + 1;

      const currentSiteId = String(log.siteId);
      siteMap[currentSiteId] = (siteMap[currentSiteId] || 0) + 1;

      const category = log.details?.category;
      if (category) {
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      }
    });

    const today = new Date();

    const dailyGenerations = Array.from({ length: safeDays }).map(
      (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (safeDays - 1 - index));

        const key = date.toISOString().slice(0, 10);

        return {
          date: key,
          count: dailyMap[key] || 0,
        };
      }
    );

    const topCategories = Object.entries(categoryMap)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const sites = await Site.findAll({
      attributes: ["id", "name"],
    });

    const topSites = Object.entries(siteMap)
      .map(([siteId, count]) => {
        const site = sites.find((s: any) => String(s.id) === siteId);

        return {
          siteId,
          siteName: site?.name || "Unknown",
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

   const recentGenerations = [...logs]
  .sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  )
  .slice(0, 10)
  .map((log: any) => {
    const site = sites.find(
      (s: any) => String(s.id) === String(log.siteId)
    );

    return {
      id: log.id,
      siteId: log.siteId,
      siteName: site?.name || `Site #${log.siteId}`,
      category: log.details?.category || "Unknown",
      createdAt: log.createdAt,
    };
  });

    return {
      generatedPages,
      generatedImages,
      generatedToday,
      generatedThisWeek,
      lastGenerationAt: lastGeneration?.createdAt || null,
      dailyGenerations,
      topCategories,
      topSites,
      recentGenerations,
    };
  }
}