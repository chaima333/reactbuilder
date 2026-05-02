import { DashboardContext } from "./types";

// استعمل الـ Context الموحد كـ Props
export const StatsCards: React.FC<DashboardContext> = ({ stats, loading }) => {
  if (loading.stats) return <div>Loading Stats...</div>;

  return (
    <div className="widget-card">
      <h3>Stats</h3>
      <p>Sites: {stats?.totalSites ?? 0}</p>
      <p>Pages: {stats?.totalPages ?? 0}</p>
      <p>Views: {stats?.totalViews ?? 0}</p>
    </div>
  );
};