
import React from "react";

import {
  TextField
} from "@mui/material";

interface TextControlProps {

  label: string;

  value: any;

  error?: string | null;

  multiline?: boolean;

  rows?: number;

  onChange: (
    value: any
  ) => void;
}

export const TextControl = ({
  label,
  value,
  error,
  multiline = false,
  rows = 1,
  onChange
}: TextControlProps) => {

  return (

    <TextField
      fullWidth

      size="small"

      label={label}

      value={value}

      error={!!error}

      helperText={error}

      multiline={multiline}

      rows={rows}

      onChange={(e) =>
        onChange(
          e.target.value
        )
      }
    />
  );
};