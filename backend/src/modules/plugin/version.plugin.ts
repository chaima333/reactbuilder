import { createHash } from "crypto";
import { PageVersion } from "../../models/pageVersion";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  async execute(event) {

    // 🧱 HARD GUARDS
    if (!event?.data?.current?.id) return;
    if (!event?.context?.siteId) return;

    const { current, previous } = event.data;

    if (!current || !previous) return;
    if (!current.id) return;

    const normalize = (p: any) => {
      if (!p) return null;

      return JSON.stringify({
        title: p.title || "",
        content: p.content || "",
        slug: p.slug || "",
        blocks: p.blocks || []
      });
    };

    const curr = normalize(current);
    const prev = normalize(previous);

    if (!curr || curr === prev) return;

    const versionTag = createHash("sha256")
      .update(`${current.id}:${curr}`)
      .digest("hex");

    try {
      await PageVersion.create({
        pageId: current.id,
        siteId: event.context.siteId,
        versionTag,
        title: current.title,
        content: current.content,
        blocks: current.blocks,
        createdBy: event.context.userId
      });

      console.log(`📜 VERSION saved: ${versionTag.slice(0, 8)}`);

    } catch (err) {
      console.error("VERSION ERROR:", err);
    }
  }
};