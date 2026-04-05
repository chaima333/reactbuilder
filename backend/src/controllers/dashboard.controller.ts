import { Request, Response } from 'express';
import { User, Site, Page, ActivityLog, sequelize } from '../models';
import { AuthRequest } from '../shared/auth.util';

// Fonction pour calculer le stockage utilisé
const calculateStorageUsed = async (userId: number) => {
  try {
    // Récupérer toutes les pages de l'utilisateur
    const pages = await Page.findAll({
      where: { userId },
      attributes: ['blocks']
    });
    
    let totalSize = 0;
    // Analyser les blocks pour trouver les images
    for (const page of pages) {
      if (page.blocks) {
        let blocks = page.blocks;
        if (typeof blocks === 'string') {
          try {
            blocks = JSON.parse(blocks);
          } catch (e) {
            blocks = [];
          }
        }
        
        if (Array.isArray(blocks)) {
          for (const block of blocks) {
            if (block.type === 'image' && block.content) {
              totalSize += 50 * 1024; // 50KB par image
            }
          }
        }
      }
    }
    
    // Convertir en MB
    const sizeInMB = Math.round(totalSize / (1024 * 1024));
    return `${sizeInMB || 0} MB`;
  } catch (error) {
    console.error('Error calculating storage:', error);
    return '0 MB';
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const [totalSites, totalPages, totalViews, recentActivities, storageUsed] = await Promise.all([
      Site.count({ where: { ownerId: userId, status: 'active' } }),
      Page.count({ where: { userId } }),
      Page.sum('views', { where: { userId } }),
      ActivityLog.findAll({
        where: { userId },
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          { model: Site, as: 'site', attributes: ['name', 'subdomain'] }
        ]
      }),
      calculateStorageUsed(userId)
    ]);

    // Statistiques par mois
    const monthlyStats = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM pages
      WHERE user_id = ${userId}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `, { type: 'SELECT' });

    res.json({
      success: true,
      data: {
        totalSites,
        totalPages,
        totalViews: totalViews || 0,
        recentActivities,
        monthlyStats,
        performance: {
          avgLoadTime: 1.2,
          uptime: 99.9,
          storageUsed: storageUsed // Dynamique !
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques' 
    });
  }
};

export const getSiteStats = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user.id;

    const site = await Site.findOne({
      where: { id: siteId, ownerId: userId },
      include: [
        { 
          model: Page, 
          as: 'pages',
          attributes: ['id', 'title', 'views', 'status', 'createdAt']
        }
      ]
    });

    if (!site) {
      return res.status(404).json({ 
        success: false, 
        message: 'Site non trouvé' 
      });
    }

    const pages = site.pages || [];
    const totalPages = pages.length;
    const totalViews = pages.reduce((sum, page) => sum + (page.views || 0), 0);
    const publishedPages = pages.filter(p => p.status === 'published').length;

    res.json({
      success: true,
      data: {
        site: {
          id: site.id,
          name: site.name,
          subdomain: site.subdomain,
          title: site.title
        },
        stats: {
          totalPages,
          totalViews,
          publishedPages,
          draftPages: totalPages - publishedPages
        },
        recentPages: pages.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title,
          views: p.views,
          status: p.status,
          createdAt: p.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Site stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques du site' 
    });
  }
};

export const getActivityLog = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { siteId, limit = 50, offset = 0 } = req.query;

    const where: any = { userId };
    if (siteId) where.siteId = siteId;

    const activities = await ActivityLog.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Site, as: 'site', attributes: ['id', 'name', 'subdomain'] }
      ]
    });

    res.json({
      success: true,
      data: {
        activities: activities.rows,
        total: activities.count,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du journal d\'activité' 
    });
  }
};