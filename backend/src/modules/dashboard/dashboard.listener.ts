import { rebuildDashboardProjection }
from "./services/rebuildDashboardProjection";

export const dashboardListener =
async (event: any) => {

  console.log(
    "📡 Dashboard listener fired"
  );

  const siteId =
    event?.data?.current?.siteId;

  if (!siteId) return;

  await rebuildDashboardProjection(
    siteId
  );

};