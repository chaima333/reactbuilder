import { sequelize } from "../../core/database/connection"; // ثبت في المسار الصحيح
import { Site, SiteMember } from "../../models";

export class SiteService {
  // CREATE مع Transaction
  static async createSite(userId: number, siteData: any) {
    const t = await sequelize.transaction();
    try {
      const site = await Site.create({
        ...siteData,
        status: 'active'
      }, { transaction: t });

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
}