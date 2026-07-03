// modules/media/commands/deleteAllMedia.handler.ts

import { Command } from "../../../core/commands/command.types";
import { Media } from "../../../models";

export const deleteAllMediaHandler = async (
  command: Command
) => {
  const userId =
    command.context?.userId;

  const siteId =
    command.context?.siteId;

  if (!userId || !siteId) {
    throw new Error(
      "Command context missing userId or siteId"
    );
  }

  const deletedCount =
    await Media.destroy({
      where: {
        userId,
        siteId
      }
    });

  return {
    success: true,
    deletedCount
  };
};