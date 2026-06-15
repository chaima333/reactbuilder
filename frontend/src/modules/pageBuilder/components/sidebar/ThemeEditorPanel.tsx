import React from "react";
import { Box, Typography, Divider, TextField, MenuItem, Tooltip, IconButton, Stack } from "@mui/material";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useTheme } from "../../core/theme/themeContext";

const themePresets = {
  brand360: {
    name: "360 Next Brand",
    primary: "#00C449",
    secondary: "#0D0D0D",
    bg: "#F2F2F2",
    surface: "#FFFFFF"
  },
  midnight: {
    name: "Midnight Pro",
    primary: "#38BDF8",
    secondary: "#0F172A", 
    bg: "#0F172A",
    surface: "#1E293B"
  },
  modern: {
    name: "Modern Clean",
    primary: "#0066FF",
    secondary: "#000000",
    bg: "#FFFFFF",
    surface: "#F8FAFC"
  }
};

const fontOptions = [
  "'Montserrat', sans-serif", 
  "'Roboto', sans-serif",
  "'Poppins', sans-serif"
];

export const ThemeEditorPanel = () => {
const { tokens, updateToken } = useTheme();
 const applyPreset = (preset: any) => {
  updateToken("colors.brand.primary", preset.primary);
  updateToken("colors.brand.secondary", preset.secondary);
  updateToken("colors.background.default", preset.bg);
  updateToken("colors.background.surface", preset.surface);
};
console.log(
 tokens.colors.background
);
  return (
    <Box p={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">🎨 Theme Editor</Typography>
        <Tooltip title="Reset to Default">
          <IconButton size="small" onClick={() => window.location.reload()}> 
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mb: 1, display: 'block' }}>
        BRAND PRESETS
      </Typography>
      <Stack direction="row" spacing={1} mb={3}>
        {Object.entries(themePresets).map(([key, p]) => (
          <Tooltip key={key} title={p.name}>
            <Box
              onClick={() => applyPreset(p)}
              sx={{
                width: 35, height: 35, borderRadius: '8px',
                bgcolor: p.primary, cursor: 'pointer',
                border: tokens.colors.brand.primary === p.primary ? '2px solid black' : '2px solid #ddd',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
                overflow: 'hidden',
                '&:hover': { transform: 'scale(1.1)' },
                transition: '0.2s'
              }}
            >
              <Box sx={{ width: '50%', height: '50%', bgcolor: p.secondary || p.bg }} />
            </Box>
          </Tooltip>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>Brand Identity</Typography>
      <Stack spacing={2}>
        <TextField
          label="Primary (Brand Green)"
          type="color" fullWidth size="small"
          value={tokens.colors.brand.primary}
          onChange={(e) => updateToken("colors.brand.primary", e.target.value)}
        />
        <TextField
          label="Secondary (Brand Black)"
          type="color" fullWidth size="small"
          value={tokens.colors.brand.secondary}
          onChange={(e) => updateToken("colors.brand.secondary", e.target.value)}
        />
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" gutterBottom>Typography</Typography>
      <Stack spacing={2}>
        <TextField
          select label="Font Family" fullWidth size="small"
          value={tokens.typography.fontFamily}
          onChange={(e) => updateToken("typography.fontFamily", e.target.value)}
        >
          {fontOptions.map((font) => (
            <MenuItem key={font} value={font} style={{ fontFamily: font }}>
              {font.split(',')[0].replace(/'/g, '')}
            </MenuItem>
          ))}
        </TextField>
        
        <Stack direction="row" spacing={1}>
           <TextField
            label="H1 Size" fullWidth size="small"
            value={tokens.typography.h1}
            onChange={(e) => updateToken("typography.h1", e.target.value)}
          />
          <TextField
            label="Body Size" fullWidth size="small"
            value={tokens.typography.body}
            onChange={(e) => updateToken("typography.body", e.target.value)}
          />
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" gutterBottom>Environment</Typography>
      <Stack spacing={2}>
        <TextField
          label="Background (Gris Clair)"
          type="color" fullWidth size="small"
          value={tokens.colors.background.default}
          onChange={(e) => updateToken("colors.background.default", e.target.value)}
        />
        <TextField
          label="Surface (White)"
          type="color" fullWidth size="small"
          value={tokens.colors.background.surface}
          onChange={(e) => updateToken("colors.background.surface", e.target.value)}
        />
      </Stack>

      <Box sx={{ mt: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px dashed #00C449' }}>
          <Typography variant="caption" color="text.secondary">
          </Typography>
      </Box>
    </Box>
  );
};


