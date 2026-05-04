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
    const { data, context } = event;
    const { current, previous } = data;

    if (!current || !previous) return;

    // 1. Normalize
    const normalize = (p: any) => ({
      title: (p.title || "").trim(),
      content: (p.content || "").trim(),
      slug: (p.slug || "").trim(),
      blocks: JSON.stringify(p.blocks || [])
    });

    const curr = normalize(current);
    const prev = normalize(previous);

    // 2. Strict diff
    const hasChange =
      curr.title !== prev.title ||
      curr.content !== prev.content ||
      curr.slug !== prev.slug ||
      curr.blocks !== prev.blocks;

    if (!hasChange) return;

    // 3. SINGLE source of truth key
    const versionTag = createHash("sha256")
      .update(
        JSON.stringify({
          pageId: current.id,
          title: curr.title,
          content: curr.content,
          slug: curr.slug,
          blocks: curr.blocks
        })
      )
      .digest("hex");

    // 4. HARD idempotency at DB level (ONLY guard you need)
    const exists = await PageVersionRepository.findByVersionTag(versionTag);

    if (exists) {
      console.log("🟡 duplicate skipped (idempotent hit)");
      return;
    }

    // 5. Save
    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionTag,
      title: curr.title,
      content: curr.content,
      blocks: JSON.parse(curr.blocks),
      createdBy: context.userId
    });

    console.log(`✅ Version saved page ${current.id}`);
  }
};