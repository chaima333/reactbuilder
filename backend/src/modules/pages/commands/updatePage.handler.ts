// src/modules/pages/commands/updatePage.handler.ts

import { Command } from "../../../core/commands/command.types";
import { PageExecutionGate } from "../../../core/gate/PageExecutionGate";

import { eventBus } from "../../../core/plugins/events/eventBus";

export const updatePageHandler = async (command: Command) => {
  const { payload, context } = command;

  // update page...

  await eventBus.emit("page.updated", {
    siteId: context.siteId,
    userId: context.userId,
    pageId: payload.id
  });

  return { success: true };
};