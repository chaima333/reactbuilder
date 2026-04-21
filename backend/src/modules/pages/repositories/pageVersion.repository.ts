import { PageVersion } from "../../../models/pageVersion";

export class PageVersionRepository {

  // 📸 create snapshot version
  static async createVersion(data: any, transaction?: any) {
    return PageVersion.create(data, { transaction });
  }

  // 📜 get history of page
  static async getHistory(pageId: number) {
    return PageVersion.findAll({
      where: { pageId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
  }

  // 🔍 get single version
  static async findById(id: number, pageId: number) {
    return PageVersion.findOne({
      where: { id, pageId },
    });
  }

  // 🧹 optional: delete old versions (future cleanup)
  static async deleteOldVersions(pageId: number, keepLast = 10) {
    const versions = await PageVersion.findAll({
      where: { pageId },
      order: [["createdAt", "DESC"]],
    });

    const toDelete = versions.slice(keepLast);

    for (const v of toDelete) {
      await v.destroy();
    }
  }
}