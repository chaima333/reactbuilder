import { sequelize } from "../../core/database/connection";
import { Site, SiteMember } from "../../models";

export class SiteService {

  // =========================
  // CREATE SITE (OK + safe)
  // =========================
  static async createSite(userId: number, siteData: any) {
    const t = await sequelize.transaction();

    try {
      const site = await Site.create(
        {
          ...siteData,
          status: "active",
        },
        { transaction: t }
      );

      await SiteMember.create(
        {
          userId,
          siteId: site.id,
          role: "OWNER",
        },
        { transaction: t }
      );

      await t.commit();
      return site;

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // =========================
  // UPDATE SITE (FIXED)
  // =========================
  static async updateSiteService(siteId: number, body: any) {
    const site = await Site.findByPk(siteId);

    if (!site) {
      throw new Error("SITE_NOT_FOUND");
    }

    await site.update(body);

    return site;
  }

  // =========================
  // GET BY ID (SERVICE LEVEL)
  // =========================
  static async getSiteById(siteId: number) {
    const site = await Site.findByPk(siteId);

    if (!site) {
      throw new Error("SITE_NOT_FOUND");
    }

    return site;
  }

  // =========================
  // DELETE (SOFT DELETE BEST PRACTICE)
  // =========================
  static async deleteSite(siteId: number) {
    const site = await Site.findByPk(siteId);

    if (!site) {
      throw new Error("SITE_NOT_FOUND");
    }

    await site.update({ status: "deleted" });

    return true;
  }
}