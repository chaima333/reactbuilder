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

const shouldVersion =
  flags?.shouldVersion ?? (data.changes?.length > 0);

if (!shouldVersion) return;
    // 🔥 state key (anti duplicate at DB level)
    const stateKey = createHash("sha256")
      .update(JSON.stringify(current))
      .digest("hex");

    const exists = await PageVersionRepository.findByStateKey(stateKey);

    if (exists) {
      console.log("🟡 Skip: version already exists");
      return;
    }

    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionNumber: stateKey, // 🔥 stable identity
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      createdBy: context.userId
    });

    console.log(`✅ Version created for page ${current.id}`);
  }
};