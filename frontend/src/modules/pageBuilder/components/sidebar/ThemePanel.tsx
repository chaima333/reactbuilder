import React from "react";
import { Box, Typography, TextField, Divider, MenuItem } from "@mui/material";
import { useTheme } from "../../core/theme/ThemeProvider";

const fonts = [
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Poppins"
];

export const ThemePanel = () => {
  const { tokens, updateToken } = useTheme();

  return (
    <Box p={2}>
      <Typography variant="h6" fontWeight="bold">
        🎨 Theme
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* 🎯 COLORS */}
      <Typography variant="subtitle2">Colors</Typography>

      <TextField
        label="Primary"
        type="color"
        fullWidth
        size="small"
        value={tokens.colors.primary}
        onChange={(e) =>
          updateToken("colors.primary", e.target.value)
        }
        sx={{ mt: 1 }}
      />

      <TextField
        label="Background"
        type="color"
        fullWidth
        size="small"
        value={tokens.colors.background}
        onChange={(e) =>
          updateToken("colors.background", e.target.value)
        }
        sx={{ mt: 2 }}
      />

      <TextField
        label="Text"
        type="color"
        fullWidth
        size="small"
        value={tokens.colors.text}
        onChange={(e) =>
          updateToken("colors.text", e.target.value)
        }
        sx={{ mt: 2 }}
      />

      <Divider sx={{ my: 3 }} />

      {/* 🔤 TYPOGRAPHY */}
      <Typography variant="subtitle2">Typography</Typography>

      <TextField
        select
        label="Font Family"
        fullWidth
        size="small"
        value={tokens.typography.fontFamily}
        onChange={(e) =>
          updateToken("typography.fontFamily", e.target.value)
        }
        sx={{ mt: 1 }}
      >
        {fonts.map((font) => (
          <MenuItem key={font} value={font}>
            {font}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};