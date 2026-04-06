import { Request, Response } from 'express';
import { Site, Page, ActivityLog } from '../models';
import { AuthRequest } from '../shared/auth.util';

// Au lieu de (req: Request), utilise (req: AuthRequest)
export const myController = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;   // ✅ Maintenant reconnu
  const { name } = req.body;   // ✅ Maintenant reconnu
  const { page } = req.query;  // ✅ Maintenant reconnu
  const authHeader = req.headers.authorization;
}
export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subdomain, title, description, language = 'fr', timezone = 'Europe/Paris' } = req.body;
    const userId = req.user.id;

    // Vérifier si le sous-domaine existe déjà
    const existingSite = await Site.findOne({ where: { subdomain } });
    if (existingSite) {
      return res.status(400).json({
        success: false,
        message: 'Ce sous-domaine est déjà utilisé'
      });
    }

    // Créer le site
    const site = await Site.create({
      name,
      subdomain,
      title,
      description,
      language,
      timezone,
      ownerId: userId,
      status: 'active'
    });

    // Journaliser l'activité
    await ActivityLog.create({
      userId,
      siteId: site.id,
      action: 'site_created',
      entityType: 'site',
      entityId: site.id,
      details: { name: site.name, subdomain: site.subdomain }
    });

    res.status(201).json({
      success: true,
      message: 'Site créé avec succès',
      data: site
    });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du site'
    });
  }
};

export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const sites = await Site.findAll({
      where: { ownerId: userId, status: 'active' },
      include: [
        {
          model: Page,
          as: 'pages',
          attributes: ['id', 'title', 'views', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculer les statistiques pour chaque site
    const sitesWithStats = sites.map(site => {
      const siteJson = site.toJSON();
      const pages = site.pages || [];
      return {
        ...siteJson,
        pagesCount: pages.length,
        totalViews: pages.reduce((sum: number, page: any) => sum + (page.views || 0), 0)
      };
    });

    res.json({
      success: true,
      data: sitesWithStats
    });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sites'
    });
  }
};

export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const site = await Site.findOne({
      where: { id, ownerId: userId },
      include: [
        {
          model: Page,
          as: 'pages',
          attributes: ['id', 'title', 'slug', 'status', 'views', 'createdAt']
        }
      ]
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site non trouvé'
      });
    }

    res.json({
      success: true,
      data: site
    });
  } catch (error) {
    console.error('Get site error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du site'
    });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, title, description, language, timezone } = req.body;

    const site = await Site.findOne({ where: { id, ownerId: userId } });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site non trouvé'
      });
    }

    await site.update({ name, title, description, language, timezone });

    // Journaliser l'activité
    await ActivityLog.create({
      userId,
      siteId: site.id,
      action: 'site_updated',
      entityType: 'site',
      entityId: site.id,
      details: { name: site.name }
    });

    res.json({
      success: true,
      message: 'Site mis à jour avec succès',
      data: site
    });
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du site'
    });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const site = await Site.findOne({ where: { id, ownerId: userId } });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site non trouvé'
      });
    }

    // Soft delete - changer le statut
    await site.update({ status: 'deleted' });

    // Journaliser l'activité
    await ActivityLog.create({
      userId,
      siteId: site.id,
      action: 'site_deleted',
      entityType: 'site',
      entityId: site.id,
      details: { name: site.name }
    });

    res.json({
      success: true,
      message: 'Site supprimé avec succès'
    });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du site'
    });
  }
};