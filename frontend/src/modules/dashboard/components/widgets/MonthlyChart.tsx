// src/modules/dashboard/components/widgets/MonthlyChart.tsx

import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DashboardCard } from "../layout/DashboardCard";

type MonthlyChartProps = {
  stats: {
    chartData: {
      month: string;
      count: number;
    }[];
  };
};

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ stats }) => {
  const theme = useTheme();
  const data = stats?.chartData || [];

  if (!data.length) {
    return (
      <DashboardCard title="Monthly Activity" subtitle="Track recent activity trends">
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">No chart data yet.</Typography>
        </Box>
      </DashboardCard>
    );
  }

  const formatted = data.map((item) => ({
    month: new Date(item.month).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
    count: item.count,
  }));

  return (
    <DashboardCard title="Monthly Activity" subtitle="Recent site momentum">
      <Box sx={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 12,
                color: theme.palette.text.primary,
              }}
            />
            <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 3, fill: theme.palette.primary.main }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
};