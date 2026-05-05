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

    const { data, context } = event;

    // 🔒 strict isolation
    if (context.source !== "page.handler") return;
    if ((context.depth || 0) > 0) return;

    const { current, previous } = data;
    if (!current || !previous) return;

    const hash = (p: any) =>
      JSON.stringify({
        title: p.title,
        content: p.content,
        slug: p.slug,
        blocks: p.blocks
      });

    const curr = hash(current);
    const prev = hash(previous);

    if (curr === prev) return;

    const versionTag = createHash("sha256")
      .update(`${current.id}:${curr}`)
      .digest("hex");

    await PageVersion.create({
      pageId: current.id,
      siteId: context.siteId,
      versionTag,
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      createdBy: context.userId
    });

    console.log(`📜 VERSION saved: ${versionTag.slice(0, 8)}`);
  }
};