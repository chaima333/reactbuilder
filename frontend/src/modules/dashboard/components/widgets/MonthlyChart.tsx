// src/modules/dashboard/components/widgets/MonthlyChart.tsx

import React from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

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

  const data =
    stats?.chartData || [];

  if (!data.length) {

    return (

      <DashboardCard
        title="Monthly Activity"
      >

        <div>
          No chart data
        </div>

      </DashboardCard>
    );
  }

  /**
   * ===============================================
   * FORMAT DATA
   * ===============================================
   */

  const formatted = data.map(
    (item) => ({

      month:
        new Date(
          item.month
        ).toLocaleDateString(
          "fr-FR",
          {
            month: "short"
          }
        ),

      count:
        item.count

    })
  );

  return (

    <DashboardCard
      title="Monthly Activity"
    >

      <div
        style={{
          width: "100%",
          height: 300
        }}
      >

        <ResponsiveContainer>

          <LineChart
            data={formatted}
          >

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#00C49A"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </DashboardCard>
  );
};