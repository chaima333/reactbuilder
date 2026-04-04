import { Response } from 'express';
import { Page, ActivityLog } from '../models';
import { AuthRequest } from '../shared/auth.util';

export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user.id;

    console.log('🔍 getPages - siteId:', siteId, 'userId:', userId);

    const pages = await Page.findAll({
      where: { siteId: Number(siteId), userId },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('❌ Get pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pages',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getPageById = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, pageId } = req.params;
    const userId = req.user.id;

    const page = await Page.findOne({
      where: { id: Number(pageId), siteId: Number(siteId), userId },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée',
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la page',
    });
  }
};

export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user.id;
    const { title, content, blocks, status = 'draft' } = req.body;

    console.log('📝 createPage - siteId:', siteId, 'title:', title);

    // Générer un slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const pageData: any = {
      title,
      slug,
      content: content || '',
      blocks: blocks || [],
      status,
      userId,
      siteId: Number(siteId),
    };

    const page = await Page.create(pageData);

    // Journaliser l'activité
    await ActivityLog.create({
      userId,
      siteId: Number(siteId),
      action: 'page_created',
      entityType: 'page',
      entityId: page.id,
      details: { title: page.title },
    });

    res.status(201).json({
      success: true,
      message: 'Page créée avec succès',
      data: page,
    });
  } catch (error) {
    console.error('❌ Create page error DETAIL:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la page',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, pageId } = req.params;
    const userId = req.user.id;
    const { title, content, blocks, status } = req.body;

    const page = await Page.findOne({
      where: { id: Number(pageId), siteId: Number(siteId), userId },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée',
      });
    }

    const updateData: any = { title, content, blocks, status };
    if (title && title !== page.title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    await page.update(updateData);

    await ActivityLog.create({
      userId,
      siteId: Number(siteId),
      action: 'page_updated',
      entityType: 'page',
      entityId: page.id,
      details: { title: page.title },
    });

    res.json({
      success: true,
      message: 'Page mise à jour avec succès',
      data: page,
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la page',
    });
  }
};

export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, pageId } = req.params;
    const userId = req.user.id;

    const page = await Page.findOne({
      where: { id: Number(pageId), siteId: Number(siteId), userId },
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée',
      });
    }

    await page.destroy();

    await ActivityLog.create({
      userId,
      siteId: Number(siteId),
      action: 'page_deleted',
      entityType: 'page',
      entityId: page.id,
      details: { title: page.title },
    });

    res.json({
      success: true,
      message: 'Page supprimée avec succès',
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la page',
    });
  }
};