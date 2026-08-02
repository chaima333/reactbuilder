import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import { CheckCircleOutline, Inventory2Outlined } from "@mui/icons-material";
import { DashboardCard } from "../layout/DashboardCard";

type VersionWidgetProps = {
  data?: {
    totalVersions: number;
    lastBackup?: string | null;
  };
};

export const VersionWidget: React.FC<VersionWidgetProps> = ({ data }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data) {
    return (
      <DashboardCard title="Snapshot History" subtitle="Recent version history">
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">No backup history found.</Typography>
        </Box>
      </DashboardCard>
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) {
      return "No backup yet";
    }

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <DashboardCard title="Snapshot History" subtitle="Keep a reliable restore trail">
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.75,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.08),
            border: `1px solid ${alpha(
              theme.palette.primary.main,
              isDark ? 0.28 : 0.16
            )}`,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                textTransform: "uppercase",
              }}
            >
              Stored Snapshots
            </Typography>
            <Typography
              variant="h4"
              sx={{ mt: 0.5, fontWeight: 800, color: "text.primary" }}
            >
              {data.totalVersions}
            </Typography>
          </Box>
          <Inventory2Outlined
            sx={{ fontSize: 24, color: theme.palette.primary.main }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
          <CheckCircleOutline
            sx={{ color: theme.palette.success.main, mt: 0.25, fontSize: 20 }}
          />
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Last backup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(data.lastBackup)}
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardCard>
  );
};
