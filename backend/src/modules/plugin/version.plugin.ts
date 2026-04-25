import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

  register() {
    console.log("🔌 VersionPlugin ready");
  },

  async execute(event: string, payload: any) {
    const { current, previous, flags } = payload;

    if (!flags?.shouldVersion) {
      console.log("🛑 versioning disabled");
      return;
    }

    console.log("📦 Creating version snapshot...");

    // هنا بعد تضيف DB logic
    // await PageVersionRepository.create(...)
  }
};