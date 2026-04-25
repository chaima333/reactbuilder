import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: [PAGE_EVENTS.UPDATED, PAGE_EVENTS.RESTORED],
  enabled: true,

  register() {
    console.log("🔌 [VersionPlugin]: Ready and Trusting the Dispatcher");
  },

  async execute(event: string, payload: any) {
    const eventId = payload?._meta?.eventId;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔥 [VersionPlugin] START");
    console.log("📍 Event:", event);
    console.log("🆔 EventID:", eventId);

    // 1️⃣ Guard: event validation (strict)
    if (![PAGE_EVENTS.UPDATED, PAGE_EVENTS.RESTORED].includes(event)) {
      console.log("🛑 Skip: unsupported event");
      return;
    }

    // 2️⃣ Guard: must have versioning flag (IMPORTANT FIX)
    if (!payload?.versioning?.enabled) {
      console.log("🛑 Skip: versioning disabled by service");
      return;
    }

    // 3️⃣ Guard: prevent missing data
    const page = payload.newPage || payload.restored;
    if (!page) {
      console.log("🛑 Skip: no page data found");
      return;
    }

    try {
      const start = Date.now();

      // 4️⃣ Normalize version type
      const versionType =
        event === PAGE_EVENTS.RESTORED ? "RESTORE" : "UPDATE";

      // 5️⃣ Create snapshot (REAL LOGIC)
      const version = await PageVersionRepository.create({
        pageId: page.id,
        siteId: payload.siteId,
        title: page.title,
        content: page.content,
        blocks: page.blocks,
        status: page.status,
        createdBy: payload.userId,

        versionTag: `${versionType.toLowerCase()}_${eventId?.slice(0, 8)}`,
        meta: {
          eventId,
          type: versionType,
          source: payload._meta?.source
        }
      });

      console.log(
        `📦 Snapshot CREATED | ID: ${version.id} | ${Date.now() - start}ms`
      );
    } catch (err) {
      console.error("💥 VersionPlugin ERROR:", err);
      if (this.isCritical) throw err;
    }

    console.log("🔥 [VersionPlugin] END");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
};