// modules/pages/commands/updatePage.handler.ts

import { Page } from "../../../models/page";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract";
import { ActivityService } from "../../dashboard/services/activity.service";
import { Site } from "../../../models/site";
import PageVersion from "../../../models/pageVersion";
import { sequelize } from "../../../core/database/connection";

export const updatePageHandler = async (command: any) => {
  try {
    const payload = command?.payload;
    const context = command?.context;

    if (!payload?.pageId) {
      return { success: false, error: "missing pageId" };
    }

    if (!context || !context.userId) {
      return { success: false, error: "invalid context" };
    }

    const allowedFields = ["title", "content", "blocks"];
    const safePayload: any = {};

    const blocks =
  payload?.blocks || [];

const findNavbar = (
  items: any[]
): any => {

  for (const item of items) {

    if (
      item.type === "navbar"
    ) {
      return item;
    }

    if (
      item.children?.length
    ) {

      const nested =
        findNavbar(
          item.children
        );

      if (nested) {
        return nested;
      }
    }
  }

  return null;
};

const navbar =
  findNavbar(blocks);

const removeNavbar = (
  items: any[]
): any[] => {

  return items
    .filter(
      (item) =>
        item.type !== "navbar"
    )
    .map((item) => ({

      ...item,

      children:
        item.children

          ? removeNavbar(
              item.children
            )

          : []
    }));
};

const filteredBlocks =

  removeNavbar(blocks);
    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        if (
  field === "blocks"
) {

  safePayload.blocks =
    filteredBlocks;

} else {

  safePayload[field] =
    payload[field];
}
      }
    }
    const updateResult = await sequelize.transaction(async (transaction) => {
      const page = await Page.findOne({
        where: {
          id: payload.pageId,
          siteId: context.siteId
        },
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!page) {
        throw new Error("PAGE_NOT_FOUND");
      }

      const oldPage = normalizePage(page);
      const nextPage = normalizePage({
        ...page.toJSON(),
        ...safePayload
      });
      const changes = getSemanticDiff(oldPage, nextPage);

      if (navbar) {
        const site = await Site.findByPk(
          context.siteId,
          { transaction }
        );

        if (site) {
          await site.update({
            globalLayout: {
              ...(site.get("globalLayout") || {}),
              navbar
            }
          }, { transaction });
        }
      }

      if (!changes.length) {
        return {
          updated: false,
          data: oldPage,
          previous: oldPage,
          changes
        };
      }

      await PageVersion.create({
        pageId: page.id,
        siteId: context.siteId,
        title: page.title,
        content: page.content,
        blocks: page.blocks,
        status: page.status,
        createdBy: context.userId
      }, { transaction });

      await page.update(
        safePayload,
        { transaction }
      );

      return {
        updated: true,
        data: normalizePage(page),
        previous: oldPage,
        changes
      };
    });

    if (!updateResult.updated) {
      return {
        success: true,
        updated: false,
        data: updateResult.data
      };
    }

    // 📡 EMIT DOMAIN EVENT (single source)
    await emitDomainEvent(
      "page.updated",
      {
        current: updateResult.data,
        previous: updateResult.previous,
        changes: updateResult.changes
      },
      {
        userId: context.userId,
        siteId: updateResult.data.siteId,
        source: "page.handler",
        depth: 0,
        traceId: context.traceId
      }
      
    );

    
    await ActivityService.log({
     userId: context.userId,
     siteId: updateResult.data.siteId,
  action: "page_updated",
  entityType: "page",
  entityId: updateResult.data.id
});
    return {
      success: true,
      updated: true,
      data: updateResult.data
    };

  } catch (error: any) {
    console.error("❌ updatePageHandler ERROR:", error.message);

    return {
      success: false,
      error: error.message
    };
  }
};
