import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";
import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract.ts";

import { createHash } from "crypto";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event: UnifiedEvent) {
    const { data, context, id } = event;
    const { current, flags } = data;

    console.log(`📦 VersionPlugin: ${id}`);

    // 🚨 STRICT RULE: engine decides everything
    if (!flags?.shouldVersion) return;

    const stateKey = createHash("sha256")
      .update(JSON.stringify({
        id: current.id,
        title: current.title,
        content: current.content,
        blocks: current.blocks
      }))
      .digest("hex");

const exists = await PageVersionRepository.findByVersionTag(stateKey);

    if (exists) {
      console.log("🟡 Skip: version already exists");
      return;
    }

    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionTag: stateKey,
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      createdBy: context.userId
    });

    console.log(`✅ Version created for page ${current.id}`);
  }
};