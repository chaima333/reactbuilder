import React from "react";

import {
  TextField
} from "@mui/material";

interface NumberControlProps {
  label: string;
  value: any;
  error?: string | null;
  field?: {
    validation?: {
      min?: number;
      max?: number;
    };
  };
  onChange: (
    value: number | ""
  ) => void;
}

export const NumberControl = ({
  label,
  value,
  error,
  field,
  onChange
}: NumberControlProps) => {
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label={label}
      value={value ?? ""}
      error={!!error}
      helperText={error}
      inputProps={{
        min: field?.validation?.min,
        max: field?.validation?.max
      }}
      onChange={(event) => {
        const nextValue =
          event.target.value;

        onChange(
          nextValue === ""
            ? ""
            : Number(nextValue)
        );
      }}
    />
  );
};
