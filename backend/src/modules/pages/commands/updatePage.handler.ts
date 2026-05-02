// src/modules/pages/commands/updatePage.handler.ts

import { Command } from "../../../core/commands/command.types";
import { PageExecutionGate } from "../../../core/gate/PageExecutionGate";

export const updatePageHandler = async (command: Command) => {
  const { pageId, data } = command.payload;

  return await PageExecutionGate.updatePage({
    pageId,
    siteId: command.context.siteId!,
    userId: command.context.userId,
    data,
  });
};