import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  alpha,
  useTheme,
  Breadcrumbs,
} from "@mui/material";
import {
  Widgets,
  Image,
  Description,
  Article,
  Layers,
  ChevronRight,
  ExpandMore,
  NavigateNext,
  SmartButton,
  Title,
  LocalOffer,
  ViewCarousel, 
  ViewStream,   
  WebAsset,
  VerticalAlignBottom,
} from "@mui/icons-material";
import { Block, BlockType } from "../../types/page.types";

interface Props {
  blocks: Block[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

// 🟢 استعمال Partial يحمي الـ Build من الانهيار عند نقص أي نوع أو اختلاف التسمية
const blockConfig: Partial<Record<BlockType, { icon: React.ReactNode; color: string; label: string }>> = {
  section: { icon: <Layers fontSize="small" />, color: "#6366f1", label: "Section" },
  text: { icon: <Description fontSize="small" />, color: "#6b7280", label: "Text" },
  image: { icon: <Image fontSize="small" />, color: "#10b981", label: "Image" },
  button: { icon: <SmartButton fontSize="small" />, color: "#3b82f6", label: "Button" },
  title: { icon: <Title fontSize="small" />, color: "#f59e0b", label: "Title" },
  hero: { icon: <LocalOffer fontSize="small" />, color: "#ef4444", label: "Hero" },
  root: { icon: <WebAsset fontSize="small" />, color: "#14b8a6", label: "Root" },
  navbar: { icon: <ViewStream fontSize="small" />, color: "#06b6d4", label: "Navigation" },
  footer: { icon: <VerticalAlignBottom fontSize="small" />, color: "#0f766e", label: "Footer" },
  cta: { icon: <SmartButton fontSize="small" />, color: "#ec4899", label: "CTA Section" },
  features: { icon: <ViewCarousel fontSize="small" />, color: "#8b5cf6", label: "Features" },
};

const getBlockLabel = (block: Block): string => {
  if (block.meta?.displayName) return block.meta.displayName;
  if (block.meta?.label) return block.meta.label;
  
  const title = block.data?.props?.title || 
                block.data?.props?.heading || 
                block.data?.props?.headline;
  
  if (title && typeof title === "string") {
    return title.length > 30 ? title.slice(0, 27) + "..." : title;
  }
  return blockConfig[block.type]?.label || block.type;
};

// 🟢 الـ Fallback هنا يضمن بقاء الأيقونة واللون مستقرين حتى لو كان النوع مجهولاً للـ Config
const getBlockIcon = (type: BlockType) => {
  return blockConfig[type]?.icon || <Widgets fontSize="small" />;
};

const getBlockColor = (type: BlockType) => {
  return blockConfig[type]?.color || "#94a3b8";
};

const findBlockPath = (
  id: string,
  blocks?: Block[],
  path: Block[] = []
): Block[] | null => {

  if (!Array.isArray(blocks)) {
    return null;
  }

  for (const block of blocks) {

    if (block.id === id) {
      return [...path, block];
    }

    if (block.children?.length) {

      const found = findBlockPath(
        id,
        block.children,
        [...path, block]
      );

      if (found) {
        return found;
      }
    }
  }

  return null;
};

export const StructurePanel = ({
  blocks = [],
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: Props) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

React.useEffect(() => {

  if (!selectedId) {
    return;
  }

  const path =
    findBlockPath(
      selectedId,
      blocks
    );

  if (!path) {
    return;
  }

  setExpanded((prev) => {

    const next = {
      ...prev
    };

    path.forEach((block) => {

      if (
        block.children?.length &&
        block.id !== selectedId
      ) {

        next[block.id] = true;
      }
    });

    return next;
  });

}, [selectedId, blocks]);

  const currentPath =
  React.useMemo(() => {

    if (!selectedId) {
      return null;
    }

    return findBlockPath(
      selectedId,
      blocks
    );

  }, [selectedId, blocks]);
  
  const renderTree = (tree: Block[], depth = 0): React.ReactNode => {
    return tree.map((block) => {
      const hasChildren = block.children && block.children.length > 0;
      const isSelected = selectedId === block.id;
      const isHovered = hoveredId === block.id;
      const blockIcon = getBlockIcon(block.type);
      const blockColor = getBlockColor(block.type);
      const blockLabel = getBlockLabel(block);
      const isHidden = block.meta?.isHidden;
      const isLocked = block.meta?.isLocked;

      return (
        <React.Fragment key={block.id}>
          <Box
            sx={{
              position: "relative",
              ml: depth * 2.5,
              mb: 0.75,
              transition: "all 0.2s ease",
              opacity: isHidden ? 0.5 : 1,
            }}
          >
            {depth > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  left: -12,
                  top: 0,
                  bottom: 0,
                  width: 1.5,
                  bgcolor: alpha(theme.palette.divider, 0.25),
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "20px",
                    left: 0,
                    width: 10,
                    height: 1.5,
                    bgcolor: alpha(theme.palette.divider, 0.25),
                  },
                }}
              />
            )}

            <Box
              onPointerEnter={() => {
                onHover?.(block.id);
              }}
              onPointerLeave={() => {
                onHover?.(null);
              }}
              onClick={() => onSelect?.(block.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                py: 1,
                borderRadius: "10px",
                cursor: isLocked ? "not-allowed" : "pointer",
                bgcolor: isSelected
                  ? alpha(theme.palette.primary.main, 0.12)
                  : isHovered
                  ? alpha(theme.palette.info.main, 0.08)
                  : "transparent",
                border: `1px solid ${
                  isSelected
                    ? alpha(theme.palette.primary.main, 0.3)
                    : isHovered
                    ? alpha(theme.palette.info.main, 0.3)
                    : "transparent"
                }`,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.16)
                    : isLocked
                    ? "transparent"
                    : alpha(theme.palette.action.hover, 0.6),
                  transform: isLocked ? "none" : "translateX(2px)",
                },
              }}
            >
              {/* Expand/Collapse */}
              {hasChildren ? (
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLocked) {
                      setExpanded((prev) => ({
                        ...prev,
                        [block.id]: !prev[block.id],
                      }));
                    }
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "4px",
                    color: theme.palette.text.secondary,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: isLocked ? "transparent" : alpha(theme.palette.action.hover, 0.8),
                    },
                  }}
                >
                  {expanded[block.id] ? <ExpandMore sx={{ fontSize: 16 }} /> : <ChevronRight sx={{ fontSize: 16 }} />}
                </Box>
              ) : (
                <Box sx={{ width: 20 }} />
              )}

              {/* Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  bgcolor: alpha(blockColor, 0.12),
                  color: blockColor,
                  flexShrink: 0,
                }}
              >
                {blockIcon}
              </Box>

              {/* Block Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {blockLabel}
                  </Typography>
                  {isLocked && (
                    <Chip label="Locked" size="small" sx={{ height: 16, fontSize: "8px", bgcolor: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.dark }} />
                  )}
                  {isHidden && (
                    <Chip label="Hidden" size="small" sx={{ height: 16, fontSize: "8px", bgcolor: alpha(theme.palette.grey[500], 0.15), color: theme.palette.text.secondary }} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: "10px", display: "block", lineHeight: 1.2 }}>
                  {block.type}
                </Typography>
              </Box>

              {/* Children count */}
              {hasChildren && (
                <Chip
                  label={block.children?.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "10px",
                    minWidth: 18,
                    bgcolor: alpha(theme.palette.divider, 0.8),
                    "& .MuiChip-label": { px: 0.8 },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Children Render */}
          {hasChildren && expanded[block.id] && (
            <Box sx={{ mt: 0.5 }}>{renderTree(block.children!, depth + 1)}</Box>
          )}
        </React.Fragment>
      );
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        overflow: "auto",
        bgcolor: "background.default",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <Layers sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Page Structure
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", ml: 4.5 }}>
          {blocks.length} {blocks.length === 1 ? "block" : "blocks"} total
        </Typography>
      </Box>

      {/* Breadcrumb */}
      {selectedId && currentPath && currentPath.length > 0 && (
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            overflowX: "auto",
          }}
        >
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="block-path">
            {currentPath.map((block, idx) => {
              const isLast = idx === currentPath.length - 1;
              return (
                <Box
                  key={block.id}
                  onClick={() => !isLast && onSelect?.(block.id)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    cursor: isLast ? "default" : "pointer",
                    opacity: isLast ? 1 : 0.7,
                    "&:hover": {
                      opacity: isLast ? 1 : 0.9,
                      textDecoration: isLast ? "none" : "underline",
                    },
                  }}
                >
                  <Box sx={{ fontSize: 12, color: getBlockColor(block.type), display: "flex" }}>
                    {getBlockIcon(block.type)}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isLast ? 600 : 400,
                      color: isLast ? theme.palette.text.primary : theme.palette.text.secondary,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getBlockLabel(block)}
                  </Typography>
                </Box>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}

      {/* Tree Content */}
      <Box sx={{ p: 2, flex: 1 }}>
        {blocks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
            <Widgets sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
            <Typography variant="body2">No blocks available</Typography>
          </Box>
        ) : (
          renderTree(blocks)
        )}
      </Box>
    </Paper>
  );
};
