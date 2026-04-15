import { Response } from 'express';
import { Site, Page, ActivityLog, SiteMember } from '../models';
import { AuthRequest } from '../shared/auth.util';
// =========================
// CREATE SITE
// =========================

export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subdomain } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false });
    }

    const site = await Site.create({
      name,
      subdomain,
      title: name,
      status: 'active'
    });

    // 🔥 THIS IS THE CORE
          await SiteMember.create({
           userId: userId,
           siteId: site.id,
           role: "OWNER"
           });

    // background stuff
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
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

// =========================
// GET SITES
// =========================

export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false });
    }

    const memberships = await SiteMember.findAll({
  where: { userId: userId },
  include: [
    {
      model: Site,
      include: [
        {
          model: Page,
          required: false
        }
      ]
    }
  ]
});

const sites = memberships.map(m => m.site);

    return res.json({
      success: true,
      data: sites
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

// =========================
// GET SITE BY ID
// =========================
export const getSiteById = async (req: AuthRequest, res: Response) => {

const { siteId } = req.params;
const site = await Site.findByPk(siteId, {
  include: [{ model: Page, as: 'pages', required: false }]
});

if (!site) {
  return res.status(404).json({
    success: false,
    message: "not found"
  });
}

return res.json({ success: true, data: site });
};

// =========================
// UPDATE SITE
// =========================
export const updateSite = async (req: AuthRequest, res: Response) => {
const { siteId } = req.params;

const site = await Site.findByPk(siteId);

if (!site) {
  return res.status(404).json({ success: false });
}

await site.update(req.body);

return res.json({
  success: true,
  data: site
});
};

// =========================
// DELETE SITE
// =========================
export const deleteSite = async (req: AuthRequest, res: Response) => {
const { siteId } = req.params;

const site = await Site.findByPk(siteId);

if (!site) {
  return res.status(404).json({ success: false });
}

await site.update({ status: 'deleted' });

return res.json({
  success: true,
  message: "deleted"
});
};