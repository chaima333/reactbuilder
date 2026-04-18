import { Response } from 'express';
import { Site, Page, ActivityLog, SiteMember } from '../../models';
import { AuthRequest } from '../../shared/auth.util';
import * as siteService from '../sites/site.service';
import { sequelize } from '../../core/database/connection';
import { SiteService } from '../sites/site.service';


// =========================
// CREATE SITE
// =========================
export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const { name, subdomain, title } = req.body;
    const userId = req.user.id;

    if (!name || !subdomain) {
      return res.status(400).json({ success: false, message: "Name and subdomain required" });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/\s+/g, "-");

    // استعمال الـ Service اللي فيه الـ Transaction
    const site = await SiteService.createSite(userId, { 
      name, 
      subdomain: cleanSubdomain, 
      title 
    });

    return res.status(201).json({ success: true, data: site });
  } catch (error: any) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "Subdomain already taken" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    // الأولوية ديما للـ ID اللي جاي من الـ Guard (أكثر أمان)
    const siteId = req.siteContext?.siteId || req.params.siteId;
    const updatedSite = await SiteService.updateSiteService(Number(siteId), req.body);
    
    return res.json({ success: true, data: updatedSite });
  } catch (error: any) {
    if (error.message === "SITE_NOT_FOUND") return res.status(404).json({ message: "Site not found" });
    return res.status(500).json({ success: false, message: "Update failed" });
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
    // 1. خوذ الـ siteId مالـ context اللي عبّاه الـ tenantResolver
    const siteId = req.siteContext?.siteId;
    const userId = req.user.id;

    // 2. تثبّت كان فمة siteId (احتياطاً)
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "No site context found. Use a valid subdomain."
      });
    }

    // 3. جيب الداتا متاع الموقع (بما إنو الـ Guard تعدّى، إذن الموقع موجود)
    const site = await Site.findByPk(siteId, {
      include: [{ model: Page, as: "pages", required: false }]
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    // 4. الـ Role توّة نجيبوه مالـ context (الـ siteGuard ديجا طلّعو مالـ DB)
    const role = req.siteContext?.role || 'VIEWER';

    // 5. الـ Permissions mapping
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
    console.error("GET_SITE_CONTROLLER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const deleteSite = async (req: AuthRequest, res: Response) => {
  const siteId = req.siteContext?.siteId;

if (!siteId) {
  throw new Error("SITE_CONTEXT_MISSING");
}
  const [affectedCount] = await Site.update(
    { status: 'deleted' }, 
    { where: { id: siteId } }
  );

  if (affectedCount === 0) return res.status(404).json({ success: false });

  return res.json({ success: true, message: "deleted" });
};