import slugify from "slugify";

import { BlockPatternRepository } from "./blockPattern.repository";
import {
  PATTERN_ERRORS,
  validatePatternPayload
} from "./blockPattern.validation";

const baseSlugFromName = (
  name: string
) =>
  slugify(name, {
    lower: true,
    strict: true
  }) || "pattern";

export class BlockPatternService {
  static async generateUniqueSlug(
    siteId: number,
    name: string,
    excludePatternId?: number
  ) {
    const baseSlug =
      baseSlugFromName(name).slice(0, 150);

    let candidate =
      baseSlug;
    let suffix = 2;

    while (
      await BlockPatternRepository.findBySlug(
        siteId,
        candidate,
        excludePatternId
      )
    ) {
      const suffixText =
        `-${suffix}`;

      candidate =
        `${baseSlug.slice(0, 160 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }

    return candidate;
  }

  static async listPatterns(siteId: number) {
    return BlockPatternRepository.findAll(siteId);
  }

  static async getPattern(
    siteId: number,
    patternId: number
  ) {
    if (
      !Number.isInteger(patternId) ||
      patternId <= 0
    ) {
      throw new Error(PATTERN_ERRORS.NOT_FOUND);
    }

    const pattern =
      await BlockPatternRepository.findById(
        siteId,
        patternId
      );

    if (!pattern) {
      throw new Error(PATTERN_ERRORS.NOT_FOUND);
    }

    return pattern;
  }

  static async createPattern(
    siteId: number,
    userId: number | null,
    payload: any
  ) {
    const validated =
      validatePatternPayload(payload) as {
        name: string;
        description: string | null;
        rootBlock: Record<string, any>;
        metadata: Record<string, any>;
      };

    const slug =
      await this.generateUniqueSlug(
        siteId,
        validated.name
      );

    return BlockPatternRepository.create({
      siteId,
      createdBy: userId,
      name: validated.name,
      slug,
      description: validated.description,
      rootBlock: validated.rootBlock,
      blockType: "section",
      metadata: validated.metadata
    });
  }

  static async updatePattern(
    siteId: number,
    patternId: number,
    payload: any
  ) {
    const pattern =
      await this.getPattern(
        siteId,
        patternId
      );

    const validated =
      validatePatternPayload(
        payload,
        {
          partial: true
        }
      );

    const updates: any = {};

    if (validated.name !== undefined) {
      updates.name = validated.name;
      updates.slug =
        await this.generateUniqueSlug(
          siteId,
          validated.name,
          patternId
        );
    }

    if (validated.description !== undefined) {
      updates.description =
        validated.description;
    }

    if (validated.rootBlock !== undefined) {
      updates.rootBlock =
        validated.rootBlock;
      updates.blockType = "section";
    }

    if (validated.metadata !== undefined) {
      updates.metadata =
        validated.metadata;
    }

    return BlockPatternRepository.update(
      pattern,
      updates
    );
  }

  static async deletePattern(
    siteId: number,
    patternId: number
  ) {
    const pattern =
      await this.getPattern(
        siteId,
        patternId
      );

    await BlockPatternRepository.delete(
      pattern
    );

    return true;
  }
}
