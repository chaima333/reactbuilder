import React from "react";
import { DashboardStats } from "../../types/dashboard.types";

type StatsCardsProps = {
  stats: DashboardStats;
};

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats
}) => {

  return (
    <div className="widget-card">

      <h3>Stats</h3>

      <p>
        Sites: {stats?.totalSites ?? 0}
      </p>

      <p>
        Pages: {stats?.totalPages ?? 0}
      </p>

      <p>
        Views: {stats?.totalViews ?? 0}
      </p>

    </div>
  );
};