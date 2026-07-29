import { Op } from "sequelize";

import { BlockPattern } from "../../models/BlockPattern.model";

export class BlockPatternRepository {
  static findAll(siteId: number) {
    return BlockPattern.findAll({
      where: {
        siteId
      },
      order: [
        ["createdAt", "DESC"]
      ]
    });
  }

  static findById(
    siteId: number,
    patternId: number
  ) {
    return BlockPattern.findOne({
      where: {
        id: patternId,
        siteId
      }
    });
  }

  static findBySlug(
    siteId: number,
    slug: string,
    excludePatternId?: number
  ) {
    return BlockPattern.findOne({
      where: {
        siteId,
        slug,
        ...(excludePatternId
          ? {
              id: {
                [Op.ne]: excludePatternId
              }
            }
          : {})
      }
    });
  }

  static create(data: any) {
    return BlockPattern.create(data);
  }

  static update(
    pattern: BlockPattern,
    data: any
  ) {
    return pattern.update(data);
  }

  static delete(pattern: BlockPattern) {
    return pattern.destroy();
  }
}
