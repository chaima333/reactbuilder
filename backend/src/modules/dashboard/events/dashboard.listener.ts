import { rebuildDashboardProjection } from "../controllers/dashboard.controller";

export const registerDashboardListener = (eventBus: any) => {
  eventBus.on("page.updated", async (event: any) => {
    await rebuildDashboardProjection(event.context.siteId);
  });
};