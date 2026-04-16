import { Response } from 'express';
import { Site, Page, ActivityLog, SiteMember } from '../../models';
import { AuthRequest } from '../../shared/auth.util';
import * as siteService from '../sites/site.service';
import { sequelize } from '../../core/database/connection';


// =========================
// CREATE SITE
// =========================


export const createSite = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();

  try {
    const { name, subdomain, title } = req.body;
    const userId = req.user.id;

    if (!name || !subdomain) {
      return res.status(400).json({
        success: false,
        message: "name and subdomain are required"
      });
    }

    // normalize subdomain (important)
    const cleanSubdomain = subdomain
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

    // 1. check existence (fast fail before DB error)
    const existing = await Site.findOne({
      where: { subdomain: cleanSubdomain },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (existing) {
      await t.rollback();
      return res.status(409).json({
        success: false,
        message: "Subdomain already taken"
      });
    }

    // 2. create site
    const site = await Site.create(
      {
        name,
        subdomain: cleanSubdomain,
        title,
        status: "active"
      },
      { transaction: t }
    );

    // 3. create membership
    await SiteMember.create(
      {
        userId,
        siteId: site.id,
        role: "OWNER"
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      data: site
    });

  } catch (error: any) {
    await t.rollback();

    // Sequelize unique fallback (safety net)
    if (error?.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists"
      });
    }

    console.error("CREATE_SITE_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// =========================
// GET SITES
// =========================

export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const memberships = await SiteMember.findAll({
      where: { userId },
      include: [
        {
          model: Site
        }
      ]
    });

    const sites = memberships.map((m: any) => {
      return {
        id: m.site.id,
        name: m.site.name,
        subdomain: m.site.subdomain,
        status: m.site.status,
        role: m.role
      };
    });

    return res.json({
      success: true,
      data: sites
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// =========================
// GET SITE BY ID
// =========================//
export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);
    const userId = req.user.id;

    const site = await Site.findByPk(siteId, {
      include: [{ model: Page, as: "pages", required: false }]
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    const membership = await SiteMember.findOne({
      where: {
        userId,
        siteId
      }
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const role = membership.role;

    // permissions mapping (simple but scalable)
    const permissionsMap: any = {
      OWNER: ["read", "edit", "delete", "invite"],
      ADMIN: ["read", "edit", "invite"],
      EDITOR: ["read", "edit"],
      VIEWER: ["read"]
    };

    return res.json({
      success: true,
      data: {
        site,
        role,
        permissions: permissionsMap[role] || []
      }
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
const siteId = req.context.membership?.siteId || req.context.site?.id;    const updatedSite = await siteService.updateSiteService(siteId, req.body);
    return res.json({ success: true, data: updatedSite });
  } catch (error: any) {
    if (error.message === "SITE_NOT_FOUND") return res.status(404).json({ message: "Site not found" });
    return res.status(500).json({ message: "Update failed" });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
const siteId = req.context.membership?.siteId || req.context.site?.id;
  const [affectedCount] = await Site.update(
    { status: 'deleted' }, 
    { where: { id: siteId } }
  );

  if (affectedCount === 0) return res.status(404).json({ success: false });

  return res.json({ success: true, message: "deleted" });
};