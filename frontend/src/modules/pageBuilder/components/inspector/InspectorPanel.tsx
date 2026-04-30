import React from "react";
import { Box, Typography, TextField, MenuItem, Divider } from "@mui/material";
import { blockRegistry } from "../../core/blockRegistry";

interface Props {
  block: any;
  device: "desktop" | "tablet" | "mobile";
  onChange: (data: any) => void;
}

export const InspectorPanel: React.FC<Props> = ({
  block,
  device,
  onChange
}) => {
  if (!block) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">
          Sélectionnez un bloc
        </Typography>
      </Box>
    );
  }

  const config = blockRegistry[block.type];
  const fields = config?.fields || [];

  const getEffectiveValue = (field: any) => {
    if (field.target === "props") {
      return block.data?.props?.[field.key] ?? "";
    }

    return (
      block.data?.style?.[device]?.[field.key] ??    // 1. القيمة في الجهاز الحالي
      block.data?.style?.desktop?.[field.key] ??     // 2. الوراثة من الـ Desktop
      block.data?.props?.[field.key] ??              // 3. Fallback للـ Props
      ""
    );
  };

  const handleFieldChange = (field: any, value: any) => {
    if (field.target === "props") {
      onChange({
        props: {
          ...block.data.props,
          [field.key]: value
        }
      });
      return;
    }

    // 🎯 تحديث الـ Style بطريقة Responsive Safe
    const currentStyles = block.data.style || {};
    const currentDeviceStyle = currentStyles[device] || {};

    onChange({
      style: {
        ...currentStyles,
        [device]: {
          ...currentDeviceStyle,
          [field.key]: value
        }
      }
    });
  };

  return (
    <Box p={2}>
      <Typography variant="subtitle1" fontWeight="bold">
        {config?.label || "Block"}
      </Typography>

      <Typography variant="caption" color="primary">
        Editing for: {device.toUpperCase()} {device === "desktop" ? "🖥️" : device === "tablet" ? " tablet 📱" : "📱"}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {fields.map((field: any) => {
          
          const value = getEffectiveValue(field);

          return (
            <TextField
              key={field.key}
              label={field.label}
              select={field.type === "select"}
              type={field.type === "color" ? "color" : "text"}
              fullWidth
              size="small"
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              SelectProps={field.type === "select" ? { displayEmpty: true } : undefined}
            >
              {field.options?.map((opt: string) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>
          );
        })}
      </Box>
    </Box>
  );
};