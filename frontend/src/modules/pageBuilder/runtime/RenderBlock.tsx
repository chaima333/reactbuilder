import React from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import { blockRegistry } from "../core/blockRegistry";
import { Block, ValidationError } from "../types/page.types"; // نزيدو الـ ValidationError
import { ErrorOutline } from "@mui/icons-material";

export const renderBlock = (
  block: Block,
  errors: ValidationError[] = [], // 👈 نمرروا الـ Errors هنا
  children?: React.ReactNode
) => {
  const config = blockRegistry[block.type as Exclude<keyof typeof blockRegistry, "root">];

  if (!config) return null;

  const blockError = errors.find((err) => err.blockId === block.id);
  const hasError = !!blockError;

  const Component = config.component;

  return (
    <Box
      key={block.id}
      sx={{
        position: "relative",
        outline: hasError ? "2px solid #d32f2f" : "none",
        outlineOffset: "-2px",
        transition: "outline 0.2s ease-in-out",
        "&:hover": {
          outline: hasError ? "2px solid #d32f2f" : "1px dashed #1976d2",
        },
      }}
    >
      {hasError && (
        <Tooltip title={blockError.message} arrow placement="top-start">
          <Box
            sx={{
              position: "absolute",
              top: -12,
              left: 10,
              zIndex: 100,
              bgcolor: "#d32f2f",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              borderRadius: "4px",
              boxShadow: 2,
              cursor: "help",
            }}
          >
            <ErrorOutline sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: "10px", fontWeight: "bold" }}>
              {blockError.type.replace("_", " ").toUpperCase()}
            </Typography>
          </Box>
        </Tooltip>
      )}

      <Component data={block.data} device="desktop">
        {children}
      </Component>
    </Box>
  );
};