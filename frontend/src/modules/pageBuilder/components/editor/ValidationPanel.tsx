import React from "react";
import { Box, Typography, Stack, Chip, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { ValidationError } from "../../types/page.types";

interface ValidationPanelProps {
  errors: ValidationError[];
  onSelectBlock: (blockId: string) => void;
}

export const ValidationPanel = ({ errors, onSelectBlock }: ValidationPanelProps) => {
  if (errors.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        m: 2,
        borderRadius: 2,
        bgcolor: "#fff5f5", // خلفية حمراء خفيفة
        border: "1px solid #ffcdd2",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
        <ErrorOutlineIcon sx={{ color: "#f44336", fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ color: "#d32f2f", fontWeight: "bold" }}>
          Validation Errors ({errors.length})
        </Typography>
      </Stack>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {errors.map((error, index) => (
          <Chip
            key={`${error.blockId}-${index}`}
            label={`${error.message}`}
            size="small"
            onClick={() => onSelectBlock(error.blockId)}
            sx={{
              bgcolor: "white",
              border: "1px solid #f44336",
              color: "#f44336",
              fontSize: "0.75rem",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#f44336",
                color: "white",
              },
            }}
          />
        ))}
      </Box>
      
      <Typography variant="caption" sx={{ color: "#ef5350", mt: 0.5, fontStyle: "italic" }}>
        * Click on an error to locate the block.
      </Typography>
    </Paper>
  );
};