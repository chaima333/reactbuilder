// src/modules/dashboard/components/widgets/MonthlyChart.tsx

import React from "react";

import { DashboardCard }
from "../layout/DashboardCard";

type MonthlyChartProps = {
  stats: {
    chartData: {
      month: string;
      count: number;
    }[];
  };
};

export const MonthlyChart:
React.FC<MonthlyChartProps> = ({
  stats
}) => {

  if (!stats) {
    return (
      <DashboardCard title="Monthly Activity">
        <div>No chart data</div>
      </DashboardCard>
    );
  }

  return (

    <DashboardCard title="Monthly Activity">

      <pre>
        {JSON.stringify(
          stats.chartData || [],
          null,
          2
        )}
      </pre>

    </DashboardCard>

  );
};