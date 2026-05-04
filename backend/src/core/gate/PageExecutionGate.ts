import { PageService } from "../../modules/pages/services/page.service";

export class PageExecutionGate {
  static async updatePage(input: any) {
    const result = await PageService.updatePage(
      input.siteId,
      input.pageId,
      input.userId,
      input.data
    );

  
    return result.data;
  }
}