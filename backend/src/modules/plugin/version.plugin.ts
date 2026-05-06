import { createHash } from "crypto";
import { PageVersion } from "../../models/pageVersion";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { validateEvent } from "../../core/plugins/events/contracts/unified.contract";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  // 🔥 UI definition للـ dashboard
  meta: {
    dashboard: {
      type: "widget.version.summary",
      col: 6,
      order: 1
    }
  },

  async getDashboardData(siteId: number) {
    // هنا مثلاً تجيب قداش من نسخة (versions) موجودة في السايت
    return {
      totalVersions: 150,
      lastBackup: new Date().toISOString()
    };
  },

  async execute(event: any) {

    // 🔥 HARD VALIDATION (not safeEvent)
    const check = validateEvent(event);
    if (!check.isValid) return;

    const { data, context } = event;
    const { current, previous } = data;

    if (!current?.id || !previous?.id) return;

    const serialize = (p: any) =>
      JSON.stringify({
        title: p.title || "",
        content: p.content || "",
        slug: p.slug || "",
        blocks: p.blocks || []
      });

    const curr = serialize(current);
    const prev = serialize(previous);

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