import React from "react";
import { alpha, Box, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import { DashboardCard } from "../layout/DashboardCard";

type SeoWidgetProps = {
  data: {
    seoScore: number;
    optimizedPages: number;
  };
};

export const SeoWidget: React.FC<SeoWidgetProps> = ({ data }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data) {
    return (
      <DashboardCard title="SEO Analysis" subtitle="Search visibility snapshot">
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">No SEO data available.</Typography>
        </Box>
      </DashboardCard>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const scoreColor = getScoreColor(data.seoScore);

  return (
    <DashboardCard title="SEO Performance" subtitle="Healthy page quality at a glance">
      <Stack spacing={2}>
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall score
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: scoreColor }}>
              {data.seoScore}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={data.seoScore}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.12),
              "& .MuiLinearProgress-bar": {
                bgcolor: scoreColor,
                borderRadius: 999,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.default, 0.6),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ fontSize: 20 }}>🔍</Box>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Optimized pages
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>
              {data.optimizedPages} pages
            </Typography>
          </Box>
        </Box>
      </Stack>
    </DashboardCard>
  );
};