import { Response } from 'express';
import { Site, Page, ActivityLog } from '../models';
import { AuthRequest } from '../shared/auth.util';

// =========================
// CREATE SITE
// =========================

      export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subdomain } = req.body;
    const userId = req.user?.id;

    const site = await Site.create({
      name,
      subdomain,
      title: name,
      ownerId: userId,
      status: 'active'
    });

    try {
       await Page.create({
  title: "Home",
  slug: `home-${site.id}-${Date.now()}`,
  site_id: site.id,
  user_id: userId,
  status: 'published'
} as any);
      await ActivityLog.create({
        userId,
        siteId: site.id,
        action: 'SITE_CREATED',
        details: { name }
      } as any);

    } catch (bgError) {
      console.error("⚠️ BACKGROUND ERROR:", bgError);
    }

    return res.status(201).json({
      success: true,
      data: site
    });

  } catch (error: any) {

    // 🔥 هنا تحط الكود متاعك
    console.error("🔥 FULL ERROR:", error);
    console.error("🔥 SQL:", error?.parent?.sql);
    console.error("🔥 DETAIL:", error?.parent?.detail);
    console.error("🔥 MESSAGE:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// =========================
// GET SITES
// =========================
export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false });
    }

    const userId = req.user.id;

    const sites = await Site.findAll({
      where: { ownerId: userId, status: 'active' },
      include: [
        {
          model: Page,
          as: 'pages',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({
      success: true,
      data: sites
    });

  } catch (error) {
    console.error("GET SITES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "error fetching sites"
    });
  }
};

// =========================
// GET SITE BY ID
// =========================
export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const site = await Site.findOne({
      where: { id, ownerId: userId },
      include: [{ model: Page, as: 'pages', required: false }]
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "not found"
      });
    }

    return res.json({ success: true, data: site });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "server error"
    });
  }
};

// =========================
// UPDATE SITE
// =========================
export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const site = await Site.findOne({ where: { id, ownerId: userId } });

    if (!site) {
      return res.status(404).json({ success: false });
    }

    await site.update(req.body);

    return res.json({
      success: true,
      data: site
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "update failed"
    });
  }
};

// =========================
// DELETE SITE
// =========================
export const deleteSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const site = await Site.findOne({ where: { id, ownerId: userId } });

    if (!site) {
      return res.status(404).json({ success: false });
    }

    await site.update({ status: 'deleted' });

    return res.json({
      success: true,
      message: "deleted"
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "delete failed"
    });
  }
};