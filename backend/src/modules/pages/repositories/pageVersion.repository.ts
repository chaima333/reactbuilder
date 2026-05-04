import { PageVersion } from "../../../models/pageVersion";

export class PageVersionRepository {

  static create(data: any, transaction?: any) {
    return PageVersion.create(data, { transaction });
  }

  static findHistory(pageId: number) {
    return PageVersion.findAll({
      where: { pageId },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
  }

  static findById(id: number, siteId: number) {
    return PageVersion.findOne({
      where: { id, siteId }
    });
  }

  static findByVersionNumber(versionNumber: string) {
    return PageVersion.findOne({
      where: { versionNumber }
    });
  }
}