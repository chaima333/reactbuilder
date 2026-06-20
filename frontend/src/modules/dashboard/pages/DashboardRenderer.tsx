import React from "react";
import { pluginRegistry } from "../registry/widget.registry";
import { DashboardFullResponse, DashboardBlock } from "../types/dashboard.types";
import { Box, Typography, Paper, Skeleton } from "@mui/material";
import { Extension } from "@mui/icons-material";

interface Props {
  layout: { blocks: DashboardBlock[] };
  context: DashboardFullResponse;
}

// ===== COMPOSANT POUR CHARGEMENT =====
const WidgetSkeleton = () => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
      border: "1px solid rgba(0,0,0,0.06)",
      height: "100%",
      minHeight: 200,
    }}
  >
    <Skeleton variant="text" width="60%" height={32} />
    <Skeleton variant="text" width="40%" height={24} />
    <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
  </Paper>
);

// ===== COMPOSANT POUR ERREUR =====
const WidgetError = ({ type }: { type: string }) => (
  <Paper
    sx={{
      p: 3,
      borderRadius: 4,
      border: "1px solid #ff6b6b",
      backgroundColor: "#fff5f5",
      height: "100%",
      minHeight: 150,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 1,
    }}
  >
    <Extension sx={{ color: "#ff6b6b", fontSize: 40 }} />
    <Typography variant="body2" color="error" fontWeight={600}>
      ⚠️ Missing Plugin: {type}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      The widget component is not registered
    </Typography>
  </Paper>
);

export default function DashboardRenderer({ layout, context }: Props) {
  // ===== PROTECTION =====
  if (!layout?.blocks || !Array.isArray(layout.blocks)) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          backgroundColor: "#fff",
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No dashboard layout configuration found.
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Please configure your dashboard widgets.
        </Typography>
      </Box>
    );
  }

  // ===== MERGE BLOCKS =====
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
      order: widget.order ?? (100 + index),
    }));

  const sortedBlocks = [...layout.blocks, ...widgetBlocks].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );

  // ===== RENDER =====
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 3,
      }}
    >
      {sortedBlocks.map((block) => {
        const Component = pluginRegistry[block.type];
        const widgetInstance = context.widgets?.find(
          (w: any) => w.id === block.id
        );

        // Widget manquant
        if (!Component) {
          return (
            <Box
              key={block.id}
              sx={{ gridColumn: `span ${block.col || 12}` }}
            >
              <WidgetError type={block.type} />
            </Box>
          );
        }

        // Widget trouvé
        return (
          <Box
            key={block.id}
            sx={{
              gridColumn: `span ${block.col || 12}`,
              minHeight: 150,
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
          </Box>
        );
      })}
    </Box>
  );
}