// modules/media/commands/deleteAllMedia.handler.ts

import { Command } from "../../../core/commands/command.types";
import { Media } from "../../../models";

export const deleteAllMediaHandler = async (command: Command) => {
  await Media.destroy({
    where: { userId: command.context.userId }
  });

  return { success: true };
};