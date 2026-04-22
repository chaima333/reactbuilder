import { Page } from "../../../models";
import { PageVersionService } from "./pageVersion.service";
import { PAGE_STATUS } from "../domain/rules";

export class PageWorkflowService {

  static async restoreVersion(siteId: number, pageId: number, versionId: number) {

    const version = await PageVersionService.getVersion(versionId, pageId);
    const page = await Page.findOne({ where: { id: pageId, siteId } });

    if (!version || !page) {
      throw new Error("VERSION_OR_PAGE_NOT_FOUND");
    }

    return await page.update({
      title: version.title,
      content: version.content,
      blocks: version.blocks,
      status: PAGE_STATUS.DRAFT
    });
  }
}