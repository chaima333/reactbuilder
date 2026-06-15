import { sequelize } from "../../core/database/connection"; // ثبت في المسار الصحيح
import { Site, SiteMember } from "../../models";
import { AdminSettingsService } from "../admin/adminSettings.service";

export class SiteService {
  static async createSite(userId: number, siteData: any, userRole?: string) {

const settings = await AdminSettingsService.getSettings();

const maxSites = settings.maxSitesPerUser ?? 5;

if (userRole !== "ADMIN") {
  const currentSitesCount = await SiteMember.count({
    where: {
      userId,
      role: "OWNER"
    },
  });

  if (currentSitesCount >= maxSites) {
    throw new Error("MAX_SITES_LIMIT_REACHED");
  }
}
    const t = await sequelize.transaction();
    try {
      const site = await Site.create({

  ...siteData,

  status: "active",

  globalLayout: {

    navbar: null,

    footer: null
  }
}
      , { transaction: t });

      await SiteMember.create({
        userId,
        siteId: site.id,
        role: 'OWNER'
      }, { transaction: t });

      await t.commit();
      return site;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // UPDATE
  static async updateSiteService(siteId: number, body: any) {
    const site = await Site.findByPk(siteId);
    if (!site) throw new Error("SITE_NOT_FOUND");
    
    return await site.update(body);
  }

  static async updateGlobalLayoutService(
    siteId: number,
    globalLayout: {
      navbar?: any | null;
      footer?: any | null;
    }
  ) {
    const site = await Site.findByPk(siteId);
    if (!site) throw new Error("SITE_NOT_FOUND");

    const currentLayout =
      site.get("globalLayout") || {};

    return await site.update({
      globalLayout: {
        ...currentLayout,
        navbar:
          globalLayout.navbar ?? null,
        footer:
          globalLayout.footer ?? null
      }
    });
  }
}
