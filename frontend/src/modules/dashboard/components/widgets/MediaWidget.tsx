import React from "react";
import { alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import { DashboardCard } from "../layout/DashboardCard";

type MediaWidgetProps = {
  data: {
    totalFiles: number;
    storageUsed: string;
    items: any[];
  };
};

export const MediaWidget: React.FC<MediaWidgetProps> = ({ data }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!data) {
    return (
      <DashboardCard title="Media Assets" subtitle="Storage overview">
        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
          <Typography variant="body2">No media assets found.</Typography>
        </Box>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Media Assets" subtitle="Latest uploaded files">
      <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Files
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.25, fontWeight: 700, color: "text.primary" }}>
              {data.totalFiles}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
              Storage
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.25, fontWeight: 700, color: theme.palette.primary.main }}>
              {data.storageUsed}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
            Recent uploads
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {data.items?.length > 0 ? (
              data.items.map((m: any) => (
                <Box
                  key={m.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.15,
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.24 : 0.12)}`,
                    color: "text.primary",
                  }}
                >
                  <span>🖼️</span>
                  <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {m.originalName}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 1 }}>
                Library is empty
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </DashboardCard>
  );
};