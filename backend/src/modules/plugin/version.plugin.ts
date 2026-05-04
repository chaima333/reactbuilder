// src/plugins/version-plugin.ts
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";
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
    const { data, context, id } = event;
    const { current, previous } = data;

    if (!current || !previous) return;

    // 🔥 1. Normalize data (important)
    const normalizeBlocks = (blocks: any[] = []) =>
      blocks.map(b => ({
        type: (b.type || "").trim(),
        data: b.data || {}
      }));

    const normalize = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      blocks: normalizeBlocks(p.blocks || [])
    });

    const curr = normalize(current);
    const prev = normalize(previous);

    // 🔥 2. Deep deterministic diff (source of truth)
    const hasMeaningfulChange =
      curr.title !== prev.title ||
      curr.content !== prev.content ||
      curr.slug !== prev.slug ||
      JSON.stringify(curr.blocks) !== JSON.stringify(prev.blocks);

    if (!hasMeaningfulChange) {
      console.log("🟡 No meaningful change → skip version");
      return;
    }

    // 🔥 3. Create deterministic versionTag
    const versionTag = createHash("sha256")
      .update(JSON.stringify({
        pageId: current.id,
        ...curr
      }))
      .digest("hex");

    // 🔥 4. Prevent duplicates
    const exists = await PageVersionRepository.findByVersionTag(versionTag);

    if (exists) {
      console.log(`🟡 Duplicate version skipped for page ${current.id}`);
      return;
    }

    // 🔥 5. Save version
    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionTag,
      title: curr.title,
      content: curr.content,
      blocks: curr.blocks,
      createdBy: context.userId
    });

    console.log(`✅ Version created for page ${current.id}`);
  }
};