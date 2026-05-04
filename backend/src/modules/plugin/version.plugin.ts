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
    const { current, changes } = data;

    // 1️⃣ تفلتر: هل التغيير يخص المحتوى؟
    const versionableFields = ["title", "content", "blocks", "slug"];
    const hasMeaningfulChange = changes.some(f => versionableFields.includes(f));
    
    if (!hasMeaningfulChange) return;

    // 2️⃣ البصمة الرقمية (Hash): تمنع التكرار حتى لو الـ Bus عاود الـ Event
           const versionTag = createHash("sha256")
  .update(JSON.stringify({
    id: current.id,
    title: current.title,
    content: current.content,
    blocks: current.blocks
  }))
  .digest("hex");

    // 3️⃣ التثبت من وجود النسخة
      const exists = await PageVersionRepository.findByVersionTag(versionTag);    if (exists) {
      console.log(`🟡 [VersionPlugin] State already versioned (${current.id})`);
      return;
    }

    // 4️⃣ التسجيل النهائي
    await PageVersionRepository.create({
      pageId: current.id,
      siteId: context.siteId,
      versionTag,
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      createdBy: context.userId
    });

    console.log(`✅ [VersionPlugin] New version saved for page ${current.id}`);
  }
};