import { Page } from "../../../models";
import { PageVersion } from "../../../models/pageVersion";
import { PAGE_STATUS } from "../rules/rules";

export class PageVersionService {

  // ================= HISTORY =================
  static async getPageHistory(pageId: number, siteId: number) {
    return PageVersion.findAll({
      where: { pageId, siteId },
      order: [["createdAt", "DESC"]],
      limit: 10
    });
  }

  // ================= GET ONE VERSION =================
  static async getVersion(versionId: number, pageId: number) {
    return PageVersion.findOne({
      where: { id: versionId, pageId }
    });
  }

  // ================= RESTORE =================
  static async restoreVersion(siteId: number, pageId: number, versionId: number) {

    const version = await this.getVersion(versionId, pageId);
    const page = await Page.findOne({ where: { id: pageId, siteId } });

    if (!version || !page) {
      throw new Error("VERSION_OR_PAGE_NOT_FOUND");
    }

    return page.update({
      title: version.title,
      content: version.content,
      blocks: version.blocks,
      status: PAGE_STATUS.DRAFT
    });
  }
}