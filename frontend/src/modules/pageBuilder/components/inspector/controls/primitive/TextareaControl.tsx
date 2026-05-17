
import React from "react";

import {
  TextField
} from "@mui/material";

interface TextareaControlProps {

  label: string;

  value: any;

  error?: string | null;

  rows?: number;

  onChange: (
    value: any
  ) => void;
}

export const TextareaControl = ({
  label,
  value,
  error,
  rows = 4,
  onChange
}: TextareaControlProps) => {

  return (

    <TextField
      fullWidth

      size="small"

      multiline

      rows={rows}

      label={label}

      value={value}

      error={!!error}

      helperText={error}

      onChange={(e) =>
        onChange(
          e.target.value
        )
      }
    />
  );
};