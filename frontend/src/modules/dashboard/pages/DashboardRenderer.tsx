import React from "react";
import { pluginRegistry } from "../registry/widget.registry";
import {
  DashboardFullResponse,
  DashboardBlock
} from "../types/dashboard.types";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  useTheme,
  alpha,
  Avatar
} from "@mui/material";
import {
  Extension,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { motion } from "framer-motion";

const colors = {
  emerald: "#00C49A",
  error: "#F22F22"
};

interface Props {
  layout: { blocks: DashboardBlock[] };
  context: DashboardFullResponse;
}

const MotionBox = motion(Box);

const WidgetSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        height: "100%",
        minHeight: 190,
        bgcolor: isDark ? alpha("#ffffff", 0.04) : "#ffffff",
        border: `1px solid ${
          isDark ? alpha("#ffffff", 0.08) : alpha("#0D0D0D", 0.06)
        }`,
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.30)"
          : "0 10px 30px rgba(13,13,13,0.06)"
      }}
    >
      <Skeleton variant="text" width="55%" height={34} sx={{ borderRadius: 2 }} />
      <Skeleton variant="text" width="35%" height={24} sx={{ borderRadius: 2 }} />
      <Skeleton
        variant="rectangular"
        height={100}
        sx={{ mt: 2, borderRadius: 3 }}
      />
    </Paper>
  );
};

const WidgetError = ({ type }: { type: string }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        minHeight: 160,
        height: "100%",
        bgcolor: isDark ? alpha(colors.error, 0.08) : "#fff5f5",
        border: `1px solid ${alpha(colors.error, 0.45)}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1
      }}
    >
      <Extension sx={{ color: colors.error, fontSize: 40 }} />

      <Typography
        variant="body2"
        sx={{
          color: colors.error,
          fontWeight: 800
        }}
      >
        Missing Plugin: {type}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          color: isDark
            ? alpha("#ffffff", 0.62)
            : alpha("#0D0D0D", 0.62)
        }}
      >
        This widget is not registered in pluginRegistry.
      </Typography>
    </Paper>
  );
};

export default function DashboardRenderer({
  layout,
  context
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!layout?.blocks || !Array.isArray(layout.blocks)) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          p: 5,
          textAlign: "center",
          minHeight: 420,
          borderRadius: 5,
          bgcolor: isDark ? alpha("#ffffff", 0.04) : "#ffffff",
          border: `1px solid ${
            isDark ? alpha("#ffffff", 0.08) : alpha("#0D0D0D", 0.06)
          }`,
          boxShadow: isDark
            ? "0 10px 30px rgba(0,0,0,0.30)"
            : "0 10px 30px rgba(13,13,13,0.06)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Avatar
          sx={{
            width: 78,
            height: 78,
            bgcolor: alpha(colors.emerald, 0.12),
            color: colors.emerald,
            mb: 2
          }}
        >
          <DashboardIcon sx={{ fontSize: 40 }} />
        </Avatar>

        <Typography variant="h6" fontWeight={900}>
          No dashboard layout found.
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: "text.secondary"
          }}
        >
          Configure dashboard widgets to start tracking this site.
        </Typography>
      </MotionBox>
    );
  }

  const widgetBlocks: DashboardBlock[] = (context.widgets || [])
    .filter((widget) => widget.enabled !== false)
    .filter(
      (widget) =>
        !layout.blocks.some((block) => block.id === widget.id)
    )
    .map((widget, index) => ({
      id: widget.id,
      type: widget.type,
      col: widget.col || 6,
      order: widget.order ?? 100 + index
    }));

  const sortedBlocks = [...layout.blocks, ...widgetBlocks].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(12, 1fr)"
        },
        gap: {
          xs: 2,
          md: 3
        },
        alignItems: "stretch"
      }}
    >
      {sortedBlocks.map((block, index) => {
        const Component = pluginRegistry[block.type];
        const widgetInstance = context.widgets?.find(
          (widget: any) => widget.id === block.id
        );

        const col = Math.min(
          12,
          Math.max(1, block.col || 12)
        );

        if (!Component) {
          return (
            <MotionBox
              key={block.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: Math.min(index * 0.04, 0.28)
              }}
              sx={{
                gridColumn: {
                  xs: "1 / -1",
                  md: `span ${col}`
                }
              }}
            >
              <WidgetError type={block.type} />
            </MotionBox>
          );
        }

        return (
          <MotionBox
            key={block.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: Math.min(index * 0.04, 0.28)
            }}
            sx={{
              gridColumn: {
                xs: "1 / -1",
                md: `span ${col}`
              },
              minHeight: 150,
              height: "100%"
            }}
          >
            <React.Suspense fallback={<WidgetSkeleton />}>
              <Component
                stats={context.stats}
                signals={context.signals}
                data={widgetInstance?.payload}
                context={context}
              />
            </React.Suspense>
          </MotionBox>
        );
      })}
    </Box>
  );
}