// src/modules/pageBuilder/components/editor/inspectors/DynamicInspector.tsx

import React, { useState } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { getNestedValue, setNestedValue } from "../../utils/pathUtils";
import { validateField } from "../../utils/validators";

type Props = {
  block: any;
  fields: any[];
  device: string;
  onChange: (newData: any) => void;
};

export const DynamicInspector = ({ block, fields, device, onChange }: Props) => {
  const currentStyle = block.data.style?.[device] || {};
  
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, p: 1 }}>
      {fields.map((field) => {
        let value = "";
        if (field.target === "style") {
          value = currentStyle[field.key] || "";
        } else if (field.target === "props") {
          value = getNestedValue(block.data.props, field.key) || "";
        }

        const handleFieldChange = (newValue: any) => {
          // 1. Validation Check
          const error = validateField(newValue, field.validation);
          
          // 2. Update Local Error State
          setErrors(prev => ({ ...prev, [field.key]: error }));

          // 3. Only trigger onChange if NO error
          if (!error) {
            if (field.target === "props") {
              const updatedProps = setNestedValue(block.data.props || {}, field.key, newValue);
              onChange({ props: updatedProps });
            }

            if (field.target === "style") {
              onChange({
                style: {
                  ...block.data.style,
                  [device]: {
                    ...currentStyle,
                    [field.key]: newValue,
                  },
                },
              });
            }
          }
        };

        const fieldError = errors[field.key];

        // --- RENDER LOGIC ---
        
        if (field.type === "text" || field.type === "textarea") {
          return (
            <TextField
              key={field.key}
              label={field.label}
              fullWidth
              size="small"
              error={!!fieldError}
              helperText={fieldError}
              multiline={field.type === "textarea"}
              rows={field.type === "textarea" ? 4 : 1}
              value={value}
              onChange={(e) => handleFieldChange(e.target.value)}
            />
          );
        }

        if (field.type === "color") {
          return (
            <Box key={field.key}>
              <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: fieldError ? 'error.main' : 'text.secondary' }}>
                {field.label} {fieldError && `(${fieldError})`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  type="color"
                  value={value || "#000000"}
                  onChange={(e) => handleFieldChange(e.target.value)}
                  style={{ width: '40px', height: '40px', border: fieldError ? '2px solid red' : 'none', cursor: 'pointer', borderRadius: '4px' }}
                />
                <TextField 
                  size="small" 
                  error={!!fieldError}
                  value={value} 
                  onChange={(e) => handleFieldChange(e.target.value)}
                  fullWidth
                />
              </Box>
            </Box>
          );
        }

        if (field.type === "select") {
          return (
            <TextField
              key={field.key}
              select
              label={field.label}
              fullWidth
              size="small"
              error={!!fieldError}
              helperText={fieldError}
              value={value}
              onChange={(e) => handleFieldChange(e.target.value)}
            >
              {field.options?.map((opt: any) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        return null;
      })}
    </Box>
  );
};