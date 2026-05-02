// core/commands/register.ts

import { CommandBus } from "./command.bus";
import { deleteAllMediaHandler } from "../../modules/media/commands/deleteAllMedia.handler";
import { updatePageHandler } from "../../modules/pages/commands/updatePage.handler";

export const registerCommands = () => {
  CommandBus.register("page.update", updatePageHandler);
  CommandBus.register("media.deleteAll", deleteAllMediaHandler);
};