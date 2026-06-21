import { AiGeneration } from "../../models/AiGeneration";

export class AiHistoryService {
  static async getHistory(
    userId: number,
    siteId: number
  ) {
    return AiGeneration.findAll({
      where: {
        userId,
        siteId
      },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
  }
}