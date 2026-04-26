import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    if (!payload.flags?.shouldVersion) return;

   await PageVersionRepository.create({
  pageId: payload.data.current.id,
  siteId: payload.context.siteId,
  title: payload.data.current.title,
  content: payload.data.current.content,
  blocks: payload.data.current.blocks,
  status: payload.data.current.status,
  createdBy: payload.context.userId
});    console.log(payload.previous?.id, payload.current?.id);
  }
};