import { ActivityLog, Page } from "../../../models";

export const fetchSignals = async (siteId: number) => {
  const [totalActivities, lastActivity, topPages] = await Promise.all([
    ActivityLog.count({ where: { siteId } }),

    ActivityLog.findOne({
      where: { siteId },
      order: [["createdAt", "DESC"]]
    }),

    Page.findAll({
      where: { siteId },
      order: [["updatedAt", "DESC"]],
      limit: 5
    })
  ]);

  return {
    totalActivities,
    lastActivity: lastActivity
      ? {
          action: lastActivity.action,
          createdAt: lastActivity.createdAt
        }
      : null,

    topPages: topPages.map(p => ({
      id: p.id,
      title: p.title,
      updatedAt: p.updatedAt
    }))
  };
};