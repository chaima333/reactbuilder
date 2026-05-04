import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersion } from "../../models/pageVersion";
import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract.ts";
import { createHash } from "crypto";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  async execute(event: UnifiedEvent) {
    const { data, context } = event;
    const { current, previous } = data;

    if (!current || !previous) return;

    // normalize (important for consistency)
    const normalize = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      blocks: JSON.stringify(p.blocks || [])
    });

    const curr = normalize(current);
    const prev = normalize(previous);

    const hasChange =
      curr.title !== prev.title ||
      curr.content !== prev.content ||
      curr.slug !== prev.slug ||
      curr.blocks !== prev.blocks;

    if (!hasChange) return;

    const versionTag = createHash("sha256")
      .update(
        JSON.stringify({
          pageId: current.id,
          ...curr
        })
      )
      .digest("hex");

    // 🔥 IMPORTANT: atomic insert (NO find first)
  try {
  await PageVersion.create({
    pageId: current.id,
    siteId: context.siteId,
    versionTag,
    title: curr.title,
    content: curr.content,
    blocks: JSON.parse(curr.blocks),
    createdBy: context.userId
  });

  console.log("✅ version saved");
} catch (err: any) {
  if (err.name === "SequelizeUniqueConstraintError") {
    console.log("🟡 duplicate ignored");
    return;
  }
  throw err;
}
  }}