import { AiGeneration } from "../../models/AiGeneration";

export class AiHistoryService {
  static async getHistory(userId: number) {
    return AiGeneration.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
  }
}