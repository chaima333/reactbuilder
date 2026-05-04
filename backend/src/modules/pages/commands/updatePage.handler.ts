import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff"; 

export const updatePageHandler = async (command: any) => {
  try {
    const { payload, context } = command;

    // 1️⃣ Fetch old
    const page = await Page.findByPk(payload.pageId);
    if (!page) {
      return { success: false, error: "Page not found" };
    }

    const oldPageN = normalizePage(page);

    // 2️⃣ Update
   const allowedFields = ["title", "content", "blocks", "slug", "status", "metaData"];

const safePayload = Object.keys(payload)
  .filter(k => allowedFields.includes(k))
  .reduce((acc: any, key) => {
    acc[key] = payload[key];
    return acc;
  }, {});
const normalizedPayload = normalizePage({
  ...page.get(),
  ...payload
});

await page.update(normalizedPayload);
    const updatedPage = await page.reload();
    const currentPageN = normalizePage(updatedPage);

    // 3️⃣ Semantic diff
    const meaningfulChanges = getSemanticDiff(oldPageN, currentPageN);

    // 4️⃣ Early exit (NO NOISE)
    if (meaningfulChanges.length === 0) {
      console.log(`ℹ️ [ENGINE] No meaningful changes for Page ${payload.pageId}`);
      return {
        success: true,
        updated: false,
        data: currentPageN
      };
    }

    console.log(`✅ [ENGINE] Meaningful changes:`, meaningfulChanges);

    // 5️⃣ Smart flags (مش spam)
    const flags = {
      shouldVersion:
        meaningfulChanges.includes("content") ||
        meaningfulChanges.includes("blocks") ||
        (meaningfulChanges.includes("status") && currentPageN.status === "published"),

      shouldSEO:
        meaningfulChanges.includes("title") ||
        meaningfulChanges.includes("slug")
    };

    // 6️⃣ Emit clean event
    await emitDomainEvent(
      "page.updated",
      {
        current: currentPageN,
        previous: oldPageN,
        changes: meaningfulChanges,
        flags
      },
      {
        ...context,
        action: "update",
        source: "page.handler"
      }
    );

    return {
      success: true,
      updated: true,
      data: currentPageN
    };

  } catch (error: any) {
    console.error("❌ [HANDLER ERROR]:", error.message);

    return {
      success: false,
      error: error.message
    };
  }
};