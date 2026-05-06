import { rebuildDashboardProjection } from "./services/rebuildDashboardProjection";

export const dashboardListener = async (event) => {
  const siteId = event?.data?.current?.siteId;

  if (!siteId) return;

  await rebuildDashboardProjection(siteId);
};