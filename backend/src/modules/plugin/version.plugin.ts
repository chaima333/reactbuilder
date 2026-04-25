import { ICmsPlugin } from "../../core/plugins/plugin.interface";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    if (!payload.flags?.shouldVersion) return;

    console.log("📦 Version snapshot");
    console.log(payload.previous?.id, payload.current?.id);
  }
};