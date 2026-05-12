import React from "react";

import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

import {
  useDraggable,
} from "@dnd-kit/core";

import {
  blockRegistry,
} from "../../core/blockRegistry";

const DraggableBlockItem = ({
  type,
  config,
}: any) => {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({

    id: `sidebar-${type}`,

    data: {
      isNew: true,
      type,
    },
  });

  return (
    <Paper
      ref={setNodeRef}

      {...listeners}
      {...attributes}

      elevation={
        isDragging ? 8 : 1
      }

      sx={{

        p: 2,

        display: "flex",
        alignItems: "center",
        gap: 1,

        cursor: "grab",

        userSelect: "none",

        opacity:
          isDragging
            ? 0.5
            : 1,

        transform:
          transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,

        transition:
          "box-shadow 0.2s ease",

        "&:hover": {
          bgcolor:
            "rgba(0,0,0,0.03)",
        },
      }}
    >
      {config.icon}

      <Typography
        variant="body2"
      >
        {config.label}
      </Typography>
    </Paper>
  );
};

export const BlockLibrary = () => {

  return (
    <Box sx={{ p: 2 }}>

      <Typography
        variant="overline"

        sx={{
          fontWeight: "bold",
          color:
            "text.secondary",
        }}
      >
        Composants
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection:
            "column",

          gap: 1,
          mt: 1,
        }}
      >

        {Object.entries(
          blockRegistry
        ).map(
          ([type, config]) => (

            <DraggableBlockItem
              key={type}
              type={type}
              config={config}
            />
          )
        )}

      </Box>
    </Box>
  );
};