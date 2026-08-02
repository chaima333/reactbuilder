import React from "react";

import { useSortable }
from "@dnd-kit/sortable";

import { CSS }
from "@dnd-kit/utilities";

import {
  Box,
  IconButton,
  Stack,
  Tooltip
} from "@mui/material";

import {
  ContentCopy,
  ControlPointDuplicate,
  ContentPaste,
  DragIndicator,
  Delete
} from "@mui/icons-material";

export const SortableBlock = ({

  id,

  children,

  isSelected,

  onClick,

  hoverData,

  setHoverData,

  onDuplicate,

  onCopy,

  onPaste,

  onDelete

}: any) => {

  const {

    attributes,

    listeners,

    setNodeRef,

    transform,

    transition,

    isDragging

  } = useSortable({ id });

  const handleMouseMove = (
    e: React.MouseEvent
  ) => {

    if (isDragging) return;

    e.stopPropagation();

    const rect =
      e.currentTarget.getBoundingClientRect();

    const middleY =
      rect.top + rect.height / 2;

    const position =
      e.clientY < middleY
        ? "before"
        : "after";

    setHoverData({
      overId: id,
      position
    });
  };

const style = {
  transform: CSS.Transform.toString(transform),
  transition,
  opacity: isDragging ? 0.3 : 1,

  position: "relative" as const,
  boxSizing: "border-box" as const,

 display: "block",

  width: "100%",

  height: "auto",

  minWidth: 0
};

  return (

    <Box
      ref={setNodeRef}

      style={style}

      onMouseMove={handleMouseMove}

      onClick={(e) => {

        e.stopPropagation();

        onClick?.();
      }}

      sx={{

        border:
          isSelected
            ? "2px solid #1976d2"
            : "2px solid transparent",

        transition:
          "all 0.2s ease",

        position:
          "relative",

        "&:hover": {

          border:
            !isSelected
              ? "2px solid #90caf9"
              : "2px solid #1976d2"
        },

        "&:hover .block-actions": {

          opacity: 1
        }
      }}
    >

      {/* DROP INDICATOR */}

      {hoverData?.overId === id &&
        !isDragging && (

        <Box
          sx={{

            position: "absolute",

            left: 0,

            right: 0,

            height: "3px",

            bgcolor: "primary.main",

            zIndex: 50,

            top:
              hoverData.position === "before"
                ? -4
                : "auto",

            bottom:
              hoverData.position === "after"
                ? -4
                : "auto",

            borderRadius: "2px",
          }}
        />
      )}

      {/* FLOATING TOOLBAR */}

      {isSelected &&
        !isDragging && (

        <Stack

          direction="row"

          spacing={0.5}

          className="block-actions"

          sx={{

            position: "absolute",

            top: -42,

            right: 0,

            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",

            borderRadius: "6px",

            p: "4px",

            zIndex: 100,

            opacity: 1,

            boxShadow: 3
          }}
        >

          <Tooltip title="Drag">

            <IconButton

              size="small"

              {...attributes}

              {...listeners}

              sx={{

                color: "text.primary",

                p: 0.5
              }}
            >

              <DragIndicator fontSize="small" />

            </IconButton>

          </Tooltip>

          <Tooltip title="Duplicate">

            <IconButton

              size="small"

              onClick={() =>
                onDuplicate?.(id)
              }

              sx={{

                color: "text.primary",

                p: 0.5
              }}
            >

              <ControlPointDuplicate
                fontSize="small"
              />

            </IconButton>

          </Tooltip>

          <Tooltip title="Copy">

            <IconButton

              size="small"

              onClick={() =>
                onCopy?.(id)
              }

              sx={{

                color: "text.primary",

                p: 0.5
              }}
            >

              <ContentCopy
                fontSize="small"
              />

            </IconButton>

          </Tooltip>

          <Tooltip title="Paste">

            <IconButton

              size="small"

              onClick={() =>
                onPaste?.(id)
              }

              sx={{

                color: "text.primary",

                p: 0.5
              }}
            >

              <ContentPaste
                fontSize="small"
              />

            </IconButton>

          </Tooltip>

          <Tooltip title="Delete">

            <IconButton

              size="small"

              onClick={() =>
                onDelete?.(id)
              }

              sx={{

                color: "error.main",

                p: 0.5,

                "&:hover": {

                  color: "error.dark"
                }
              }}
            >

              <Delete
                fontSize="small"
              />

            </IconButton>

          </Tooltip>

        </Stack>
      )}

      {/* REAL BLOCK */}

<Box
  sx={{
    width: "100%"
  }}
>

  {children}

</Box>

    </Box>
  );
};
