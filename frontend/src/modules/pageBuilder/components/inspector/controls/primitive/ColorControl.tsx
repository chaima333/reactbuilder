
import React from "react";

import {
  Box,
  Typography,
  TextField
} from "@mui/material";

interface ColorControlProps {

  label: string;

  value: any;

  error?: string | null;

  onChange: (
    value: any
  ) => void;
}

export const ColorControl = ({
  label,
  value,
  error,
  onChange
}: ColorControlProps) => {

  return (

    <Box>

      <Typography
        variant="caption"
        sx={{

          mb: 0.5,

          display: "block",

          color:
            error
              ? "error.main"
              : "text.secondary"
        }}
      >

        {label}

        {error &&
          ` (${error})`}

      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center"
        }}
      >

        <input
          type="color"

          value={
            value ||
            "#000000"
          }

          onChange={(e) =>
            onChange(
              e.target.value
            )
          }

          style={{

            width: "40px",

            height: "40px",

            border:
              error
                ? "2px solid red"
                : "none",

            cursor: "pointer",

            borderRadius:
              "4px"
          }}
        />

        <TextField
          fullWidth

          size="small"

          value={value}

          error={!!error}

          helperText={error}

          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
        />

      </Box>

    </Box>
  );
};