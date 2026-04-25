import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  events: [PAGE_EVENTS.UPDATED],
  enabled: true,

  register({ eventBus }) {
    console.log("🔌 [VersionPlugin]: Registered for sync snapshots");
  },

async execute(event: string, payload: any) {
  const { shouldVersion, oldPage, siteId, userId } = payload;

  // 🛡️ لو الـ Data ناقصة، ما تخليهوش يوصل للـ Repository.create
  if (!shouldVersion || !oldPage || !oldPage.id) {
    console.log("⚠️ [VersionPlugin]: Skipping, missing required data", { 
      shouldVersion, 
      hasOldPage: !!oldPage, 
      id: oldPage?.id 
    });
    return;
  }

  try {
    await PageVersionRepository.create({
      pageId: Number(oldPage.id), // 👈 تأكد إنو الرقم موجود هنا
      siteId: Number(siteId),
      title: oldPage.title,
      // ... بقية الـ data
    });
  } catch (err) {
    console.error("💥 [VersionPlugin DB Error]:", err.message);
  }
}
};