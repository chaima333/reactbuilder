import React from "react";
import { Stack, Typography, useTheme } from "@mui/material";
import { Article, Public, Visibility } from "@mui/icons-material";
import { DashboardCard } from "../layout/DashboardCard";
import { DashboardStats } from "../../types/dashboard.types";

type StatsCardsProps = {
  stats: DashboardStats;
};

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const theme = useTheme();

  const items: Array<{
    label: string;
    value: string | number;
    detail?: string;
    accent: string;
    icon: React.ReactNode;
  }> = [
    {
      label: "Current Site",
      value: stats?.siteName || "Unknown",
      detail: `Site ID: ${stats?.siteId ?? "-"}`,
      accent: theme.palette.primary.main,
      icon: <Public fontSize="small" />,
    },
    {
      label: "Total Pages",
      value: stats?.totalPages ?? 0,
      accent: theme.palette.success.main,
      icon: <Article fontSize="small" />,
    },
    {
      label: "Total Views",
      value: stats?.totalViews ?? 0,
      accent: theme.palette.secondary.main,
      icon: <Visibility fontSize="small" />,
    },
  ];

  return (
    <Stack
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gap: { xs: 2, md: 2.5 },
      }}
    >
      {items.map((item) => {
        const displayValue =
          typeof item.value === "number"
            ? item.value.toLocaleString()
            : String(item.value);

        return (
          <DashboardCard
            key={item.label}
            title={item.label}
            subtitle={item.detail}
            icon={item.icon}
            sx={{ minHeight: 168 }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: item.accent,
              }}
            >
              {displayValue}
            </Typography>
          </DashboardCard>
        );
      })}
    </Stack>
  );
};
