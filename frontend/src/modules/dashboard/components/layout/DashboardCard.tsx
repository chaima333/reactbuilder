import React from "react";
import { alpha, Box, Paper, Typography, useTheme } from "@mui/material";

type DashboardCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: string;
  sx?: Record<string, any>;
};

export const DashboardCard = ({
  title,
  children,
  icon,
  subtitle,
  sx,
}: DashboardCardProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        ...(sx || {}),
        p: 3,
        borderRadius: "20px",
        bgcolor: "background.paper",
        color: "text.primary",
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.7),
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isDark ? "none" : "0 4px 12px 0 rgba(0,0,0,0.03)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isDark ? "none" : "0 12px 24px -10px rgba(0,0,0,0.1)",
          borderColor: theme.palette.primary.light,
          "& .card-icon": {
            transform: "scale(1.1) rotate(-5deg)",
            color: theme.palette.primary.main,
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        {icon && (
          <Box
            className="card-icon"
            sx={{
              color: "text.secondary",
              transition: "0.3s ease",
              display: "flex",
              p: 1,
              borderRadius: "12px",
              bgcolor: "action.hover",
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </Paper>
  );
};
