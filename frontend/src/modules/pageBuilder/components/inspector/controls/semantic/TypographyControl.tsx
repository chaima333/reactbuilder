import React from "react";

import {
  Box,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";

// =========================
// Props
// =========================

interface TypographyControlProps {

  label: string;

  value: unknown;

  error?: string | null;

  onChange: (
    value: string
  ) => void;
}

// =========================
// Font Size Tokens
// =========================

const FONT_SIZES = [

  "bodyMD",

  "bodyLG",

  "displayLG",

  "displayXL"
];

// =========================
// Font Weights
// =========================

const FONT_WEIGHTS = [

  "400",

  "500",

  "600",

  "700"
];

// =========================
// Component
// =========================

export const TypographyControl = ({
  label,
  value,
  error,
  onChange
}: TypographyControlProps) => {

  const isWeight =
    label
      .toLowerCase()
      .includes(
        "weight"
      );

  const options =
    isWeight
      ? FONT_WEIGHTS
      : FONT_SIZES;

  return (

    <Box
      sx={{

        display: "flex",

        flexDirection:
          "column",

        gap: 1
      }}
    >

      <Typography
        variant="body2"

        fontWeight={600}
      >

        {label}

      </Typography>

      <TextField
        select

        fullWidth

        size="small"

        value={value ?? ""}

        error={!!error}

        helperText={error}

        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
      >

        {options.map(
          (option) => (

            <MenuItem
              key={option}

              value={option}
            >

              {option}

            </MenuItem>
          )
        )}

      </TextField>

    </Box>
  );
};