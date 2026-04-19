import { Response } from 'express';
import { AuthRequest } from '../../shared/auth.util';
import * as DashboardService from './dashboard.service';
import { ActivityLog, User, Site } from '../../models';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const data = await DashboardService.fetchDashboardStats(req.user.id);
    res.json({
      success: true,
      data: {
        ...data,
        performance: { avgLoadTime: 1.2, uptime: 99.9, storageUsed: data.storageUsed }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur stats dashboard' });
  }
};

export const getSiteStats = async (req: AuthRequest, res: Response) => {
  try {
    const site = await DashboardService.fetchSiteStats(req.params.siteId, req.user.id);
    if (!site) return res.status(404).json({ success: false, message: 'Site non trouvé' });

    const pages = (site as any).pages || [];
    const totalViews = pages.reduce((sum: number, p: any) => sum + (p.views || 0), 0);

    res.json({
      success: true,
      data: {
        site: { id: site.id, name: site.name, subdomain: site.subdomain },
        stats: { totalPages: pages.length, totalViews, publishedPages: pages.filter((p: any) => p.status === 'published').length },
        recentPages: pages.slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Erreur stats site' });
  }
};

export const getActivityLog = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, limit = 50, offset = 0 } = req.query;
    const where: any = { userId: req.user.id };
    if (siteId) where.siteId = siteId;

    const activities = await ActivityLog.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar'] },
        { model: Site, as: 'site', attributes: ['id', 'name'] }
      ]
    });

    res.json({ success: true, data: { activities: activities.rows, total: activities.count } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur activity log' });
  }
};