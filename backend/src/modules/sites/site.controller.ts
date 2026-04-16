import { Response } from 'express';
import { Site, Page, ActivityLog, SiteMember } from '../../models';
import { AuthRequest } from '../../shared/auth.util';
import * as siteService from '../sites/site.service';
import { sequelize } from '../../core/database/connection';
// =========================
// CREATE SITE
// =========================


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
// =========================//
export const getSiteById = async (req: AuthRequest, res: Response) => {
  const siteId = req.siteContext!.siteId; 
  const site = await Site.findByPk(siteId, {
    include: [{ model: Page, as: 'pages', required: false }]
  });
  if (!site) return res.status(404).json({ message: "Site not found" });
  return res.json({ success: true, data: site });
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext!.siteId;
    const updatedSite = await siteService.updateSiteService(siteId, req.body);
    return res.json({ success: true, data: updatedSite });
  } catch (error: any) {
    if (error.message === "SITE_NOT_FOUND") return res.status(404).json({ message: "Site not found" });
    return res.status(500).json({ message: "Update failed" });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
  const siteId = req.siteContext!.siteId; // 👈 استعملنا الـ Context موش الـ params

  const [affectedCount] = await Site.update(
    { status: 'deleted' }, 
    { where: { id: siteId } }
  );

  if (affectedCount === 0) return res.status(404).json({ success: false });

  return res.json({ success: true, message: "deleted" });
};