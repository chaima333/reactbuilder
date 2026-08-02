import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import { DashboardCard } from "../layout/DashboardCard";

type ActivityItem = {
  id: number;
  action: string;
  createdAt: string;
};

type ActivityFeedProps = {
  signals: {
    totalActivities: number;
    lastActivity: ActivityItem | null;
    topPages: any[];
  };
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ signals }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!signals || !signals.lastActivity) {
    return (
      <DashboardCard title="Recent Activity" subtitle="Activity stream">
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">☕ No recent pulses detected.</Typography>
        </Box>
      </DashboardCard>
    );
  }

  const getActionStyle = (action: string) => {
    if (action.includes("updated")) return { color: theme.palette.info.main, bg: alpha(theme.palette.info.main, isDark ? 0.16 : 0.1), label: "Update" };
    if (action.includes("created")) return { color: theme.palette.success.main, bg: alpha(theme.palette.success.main, isDark ? 0.16 : 0.1), label: "New" };
    if (action.includes("deleted")) return { color: theme.palette.error.main, bg: alpha(theme.palette.error.main, isDark ? 0.16 : 0.1), label: "Delete" };
    return { color: theme.palette.text.secondary, bg: alpha(theme.palette.divider, 0.6), label: "Action" };
  };

  const style = getActionStyle(signals.lastActivity.action);

  return (
    <DashboardCard title="Recent Activity" subtitle="Latest system pulses">
      <Stack spacing={2}>
        <Box
          sx={{
            display: "inline-flex",
            alignSelf: "flex-start",
            px: 1.25,
            py: 0.6,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
            color: theme.palette.primary.main,
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {signals.totalActivities} total events
        </Box>

        <Box sx={{ position: "relative", pl: 3, ml: 0.75, borderLeft: `2px solid ${theme.palette.divider}` }}>
          <Box
            sx={{
              position: "absolute",
              left: -6.5,
              top: 0,
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: style.color,
              border: `3px solid ${theme.palette.background.paper}`,
              boxShadow: `0 0 0 1px ${theme.palette.divider}`,
            }}
          />

          <Box sx={{ mb: 1 }}>
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 1,
                py: 0.4,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 800,
                textTransform: "uppercase",
                color: style.color,
                bgcolor: style.bg,
                mr: 1,
              }}
            >
              {style.label}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {new Date(signals.lastActivity.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {signals.lastActivity.action.replace(/_/g, " ")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Activity logged via system pulse.
          </Typography>
        </Box>

        {signals.topPages?.length > 0 && (
          <Box sx={{ pt: 1.5, borderTop: `1px dashed ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Top active pages
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1 }}>
              {signals.topPages.slice(0, 2).map((page: any) => (
                <Box key={page.id} sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                  <span>📄</span>
                  <Typography variant="body2">{page.title}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </DashboardCard>
  );
};