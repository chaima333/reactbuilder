import { createHash } from "crypto";
import { PageVersion } from "../../models/pageVersion";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { safeEvent } from "../../core/plugins/events/contracts/event.safe";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  async execute(event: any) {

    // 🔥 SAFE ENTRY
    const safe = safeEvent(event);
    if (!safe) return;

    const { current, previous } = safe.data;
    const { context } = safe;

    if (!current || !current.id) return;
    if (!previous) return;

    const serialize = (p: any) =>
      JSON.stringify({
        title: p.title || "",
        content: p.content || "",
        slug: p.slug || "",
        blocks: p.blocks || []
      });

    const curr = serialize(current);
    const prev = serialize(previous);

    // no change → skip
    if (curr === prev) return;

    const versionTag = createHash("sha256")
      .update(`${current.id}:${curr}`)
      .digest("hex");

    try {
      await PageVersion.create({
        pageId: current.id,
        siteId: context.siteId,
        versionTag,
        title: current.title,
        content: current.content,
        blocks: current.blocks,
        createdBy: context.userId
      });

      console.log(`📜 VERSION SAVED: ${versionTag.slice(0, 8)}`);

    } catch (err) {
      console.error("VERSION ERROR:", err);
    }
  }
};