
import { Page } from "../../../models/page";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  // 1. update real data
  const page = await Page.update(
    { title: payload.title },
    { where: { id: payload.pageId, siteId: context.siteId } }
  );

  // 2. log effect
  console.log("🔥 PAGE UPDATED:", payload.pageId);

  // 3. return meaningful result
  return {
    success: true,
    updated: true,
    pageId: payload.pageId
  };
};