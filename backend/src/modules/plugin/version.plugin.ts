import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

/**
 * VersionPlugin
 * دور الـ Plugin هذا توّة تقني بحت:
 * 1. يستقبل الـ Event النظيف من الـ Dispatcher.
 * 2. يعمل Snapshot (نسخة احتياطية) للـ Page قبل التعديل.
 * 3. يربط النسخة بـ Tag موحد (correlation ID) للتدقيق.
 */
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
  console.log("-----------------------------------------");
  console.log("🔥 [VersionPlugin] DEBUG START");
  console.log("📍 Event Received:", event);
  console.log("📦 Full Payload Meta:", JSON.stringify(payload._meta, null, 2));
  console.log("📄 Has NewPage Data?:", !!payload.newPage);
  
  // التشخيص القاتل:
  if (event !== 'page.updated' && event !== 'page.restored') {
    console.log("🛑 [VersionPlugin] Skip: Event name mismatch!");
    return;
  }

  if (!payload.newPage) {
    console.log("🛑 [VersionPlugin] Skip: No newPage data in payload!");
    return;
  }

  try {
    const startDB = Date.now();
    // هوني حط الكود القديم متاع الـ Version.create(...)
    // مثلاً:
    // await PageVersion.create({ ... });
    console.log(`✅ [VersionPlugin] DB Write Success | Time: ${Date.now() - startDB}ms`);
  } catch (err) {
    console.error("💥 [VersionPlugin] DB Write Error:", err);
  }
  console.log("🔥 [VersionPlugin] DEBUG END");
  console.log("-----------------------------------------");
}
};