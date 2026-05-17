// src/modules/pageBuilder/components/editor/inspector/controls/primitive/SelectControl.tsx
import React from "react";

import {
  TextField,
  MenuItem
} from "@mui/material";

interface SelectControlProps {

  label: string;

  value: any;

  options?: {
    label: string;
    value: any;
  }[];

  error?: string | null;

  onChange: (
    value: any
  ) => void;
}

export const SelectControl = ({
  label,
  value,
  options = [],
  error,
  onChange
}: SelectControlProps) => {

  return (

    <TextField
      select

      fullWidth

      size="small"

      label={label}

      value={value}

      error={!!error}

      helperText={error}

      onChange={(e) =>
        onChange(
          e.target.value
        )
      }
    >

      {options.map((opt) => (

        <MenuItem
          key={opt.value}
          value={opt.value}
        >

          {opt.label}

        </MenuItem>
      ))}

    </TextField>
  );
};