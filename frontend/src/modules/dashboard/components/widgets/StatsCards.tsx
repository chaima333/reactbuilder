import React from "react";

import { DashboardStats }
from "../../types/dashboard.types";

import { DashboardCard }
from "../layout/DashboardCard";

type StatsCardsProps = {
  stats: DashboardStats;
};

export const StatsCards:
React.FC<StatsCardsProps> = ({
  stats
}) => {

  return (

    <DashboardCard title="Statistics">

      <p>
        Sites:
        {" "}
        {stats?.totalSites ?? 0}
      </p>

      <p>
        Pages:
        {" "}
        {stats?.totalPages ?? 0}
      </p>

      <p>
        Views:
        {" "}
        {stats?.totalViews ?? 0}
      </p>

    </DashboardCard>

  );
};