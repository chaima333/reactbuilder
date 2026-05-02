// src/modules/dashboard/components/widgets/MonthlyChart.tsx
import React from "react";
import { DashboardContext } from "./types"; // استعمل الـ Context الموحد

export const MonthlyChart: React.FC<DashboardContext> = ({ stats, loading }) => {
  // توّة TypeScript يعرف إنو loading.stats موجودة بوضوح
  if (loading.stats) return <div>Loading chart...</div>;

  return (
    <div className="widget-card">
      <h3>Monthly Activity</h3>
      <pre>
        {JSON.stringify(stats?.chartData || [], null, 2)}
      </pre>
    </div>
  );
};