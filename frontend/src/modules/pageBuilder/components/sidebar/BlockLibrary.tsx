import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useDraggable } from "@dnd-kit/core";
import { blockRegistry } from "../../core/blockRegistry";

const DraggableBlockItem = ({
  type,
  config,
  presetData,
  id
}: any) => {

  const {
    attributes,
    listeners,
    setNodeRef
  } = useDraggable({
    id: id || `sidebar-${type}`,
    data: {
      isNew: true,
      type,
      presetData
    }
  });

  if (!config) return null;

  return (
    <Paper
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        p: 1.5,
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "grab",
        "&:hover": {
          bgcolor: "action.hover"
        }
      }}
    >
      {config.icon}

      <Typography
        variant="body2"
        sx={{ fontWeight: 500 }}
      >
        {config.label}
      </Typography>
    </Paper>
  );
};

export const BlockLibrary = () => {

  return (

    <Box sx={{ p: 2 }}>

      {/* Structures */}
      <Typography
        variant="overline"
        sx={{
          fontWeight: "bold",
          color: "primary.main",
          display: "block",
          mb: 1
        }}
      >
        Structures
      </Typography>

      <Box sx={{ mb: 3 }}>

        <DraggableBlockItem
          id="preset-2-cols"
          type="flex"
          config={{
            label: "2 Columns (50/50)",
            icon:
              blockRegistry.flex?.icon
          }}

          presetData={{

            style: {
              desktop: {
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                width: "100%"
              }
            },

            children: [

              {
                type: "flexItem",

                data: {
                  style: {
                    desktop: {
                      flex: "1 1 0%",
                      minWidth: "0px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      padding: "20px"
                    }
                  }
                }
              },

              {
                type: "flexItem",

                data: {
                  style: {
                    desktop: {
                      flex: "1 1 0%",
                      minWidth: "0px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      padding: "20px"
                    }
                  }
                }
              }

            ]
          }}
        />

      </Box>

      {/* Components */}
      <Typography
        variant="overline"
        sx={{
          fontWeight: "bold",
          color: "text.secondary",
          display: "block",
          mb: 1
        }}
      >
        Composants
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5
        }}
      >

        <DraggableBlockItem
          type="section"
          config={blockRegistry.section}
        />

        <DraggableBlockItem
          type="flex"
          config={blockRegistry.flex}
        />

        <DraggableBlockItem
          type="flexItem"
          config={blockRegistry.flexItem}
        />

        <DraggableBlockItem
          type="grid"
          config={blockRegistry.grid}
        />

        <DraggableBlockItem
          type="gridItem"
          config={blockRegistry.gridItem}
        />

        <Box
          sx={{
            my: 1,
            borderBottom: "1px dashed #ccc"
          }}
        />

        <DraggableBlockItem
          type="title"
          config={blockRegistry.title}
        />

        <DraggableBlockItem
          type="text"
          config={blockRegistry.text}
        />

        <DraggableBlockItem
          type="image"
          config={blockRegistry.image}
        />

        <DraggableBlockItem
          type="button"
          config={blockRegistry.button}
        />

        <Box
          sx={{
            my: 1,
            borderBottom: "1px dashed #ccc"
          }}
        />

        <DraggableBlockItem
          type="hero"
          config={blockRegistry.hero}
        />

        <DraggableBlockItem
          type="cta"
          config={blockRegistry.cta}
        />

        <DraggableBlockItem
          type="features"
          config={blockRegistry.features}
        />

      </Box>

    </Box>
  );
};