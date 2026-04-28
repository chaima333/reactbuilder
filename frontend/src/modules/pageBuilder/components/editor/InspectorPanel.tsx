import React from "react";
import { Box, TextField, Typography, Divider } from "@mui/material";

export const InspectorPanel = ({ block, registry, onChange }: any) => {
  if (!block) return <Box sx={{ p: 3, textAlign: 'center' }}>Sélectionnez un bloc</Box>;

  const config = registry[block.type];
  if (!config || !config.inspector) return <Box sx={{ p: 3 }}>Aucun paramètre</Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Réglages: {config.label}</Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography variant="overline" color="primary">Contenu</Typography>
      {config.inspector.props?.map((field: any) => (
        <TextField
          key={field.key}
          fullWidth
          label={field.label}
          size="small"
          margin="normal"
          value={block.data.props[field.key] || ""}
          onChange={(e) => onChange(block.id, { 
            props: { ...block.data.props, [field.key]: e.target.value } 
          })}
        />
      ))}

      {config.inspector.style && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="overline" color="secondary">Style</Typography>
          {config.inspector.style.map((field: any) => (
            <TextField
              key={field.key}
              fullWidth
              label={field.label}
              size="small"
              margin="normal"
              value={block.data.style[field.key] || ""}
              onChange={(e) => onChange(block.id, { 
                style: { ...block.data.style, [field.key]: e.target.value } 
              })}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};