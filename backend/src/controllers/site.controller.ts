import { Response } from 'express';
import { Site, Page, ActivityLog, SiteMember } from '../models';
import { AuthRequest } from '../shared/auth.util';
// =========================
// CREATE SITE
// =========================

// src/controllers/site.controller.ts
import { sequelize } from '../database/connection'; // تأكد من الـ import الصحيح للـ instance

export const createSite = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction(); // بداية الـ Transaction

  try {
    const { name, subdomain, title } = req.body;
    const userId = req.user.id;

    // 1. إنشاء الموقع
    const site = await Site.create({
      name,
      subdomain,
      title,
      status: 'active'
    }, { transaction: t });

    // 2. تعيين المستخدم كـ OWNER فوراً
    await SiteMember.create({
      userId: userId,
      siteId: site.id,
      role: 'OWNER'
    }, { transaction: t });

    // لو وصلنا هنا، كل شيء مريغل
    await t.commit();

    return res.status(201).json({ success: true, data: site });

  } catch (error: any) {
    await t.rollback(); // لو صارت أي غلطة، نلغيو كل شيء
    console.log("❌ TRANSACTION ERROR DETAILS:", error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: "Subdomain already taken" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
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