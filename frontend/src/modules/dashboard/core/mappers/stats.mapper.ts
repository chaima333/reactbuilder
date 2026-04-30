export const mapStatsCards = (stats: any, t: any) => {
  return [
    {
      key: "sites",
      title: t.totalSites,
      value: stats?.totalSites ?? 0,
      icon: "sites",
      color: "#00C449", 
    },
    {
      key: "pages",
      title: t.totalPages,
      value: stats?.totalPages ?? 0,
      icon: "pages",
      color: "#0D0D0D", 
    },
    {
      key: "views",
      title: t.totalViews,
      value: stats?.totalViews ?? 0,
      icon: "views",
      color: "#10E05B", 
    },
    {
      key: "storage",
      title: t.storage,
      value: stats?.performance?.storageUsed ?? "0 MB",
      icon: "storage",
      color: "#4A4A4A", 
    },
  ];
};