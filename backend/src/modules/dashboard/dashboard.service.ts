import { User, Site, Page, ActivityLog } from '../../models';
import { sequelize } from '../../core/database/connection';

// حساب مساحة التخزين المستعملة
export const calculateStorageUsed = async (userId: number) => {
  try {
    const pages = await Page.findAll({
      where: { userId },
      attributes: ['blocks']
    });

    let totalSize = 0;
    for (const page of pages) {
      if (page.blocks) {
        let blocks = typeof page.blocks === 'string' ? JSON.parse(page.blocks) : page.blocks;
        if (Array.isArray(blocks)) {
          blocks.forEach((block: any) => {
            if (block.type === 'image' && block.content) totalSize += 50 * 1024; // 50KB per image
          });
        }
      }
    }
    const sizeInMB = Math.round(totalSize / (1024 * 1024));
    return `${sizeInMB || 0} MB`;
  } catch (error) {
    return '0 MB';
  }
};

// جلب إحصائيات الداشبورد العامة
export const fetchDashboardStats = async (userId: number) => {
  const [totalSites, totalPages, totalViews, recentActivities, storageUsed] = await Promise.all([
    Site.count({ where: { ownerId: userId, status: 'active' } }),
    Page.count({ where: { userId } }),
    Page.sum('views', { where: { userId } }),
    ActivityLog.findAll({
      where: { userId },
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{ model: Site, as: 'site', attributes: ['name', 'subdomain'] }]
    }),
    calculateStorageUsed(userId)
  ]);

  const monthlyStats = await sequelize.query(`
    SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
    FROM pages WHERE user_id = ${userId}
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month DESC LIMIT 12
  `, { type: 'SELECT' });

  return { totalSites, totalPages, totalViews: totalViews || 0, recentActivities, monthlyStats, storageUsed };
};

// جلب إحصائيات موقع معين
export const fetchSiteStats = async (siteId: string, userId: number) => {
  return await Site.findOne({
    where: { id: siteId, ownerId: userId },
    include: [{ model: Page, as: 'pages', attributes: ['id', 'title', 'views', 'status', 'createdAt'] }]
  });
};