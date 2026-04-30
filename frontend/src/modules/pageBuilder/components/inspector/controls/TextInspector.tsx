
import { Box, TextField, Typography } from "@mui/material";

export const TextInspector = ({ block, device, onChange }: any) => {
  const currentStyle = block.data.style?.[device] || {};

  const updateStyle = (key: string, value: string) => {
    onChange({
      style: {
        ...block.data.style,
        [device]: { ...currentStyle, [key]: value }
      }
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold' }}>
        TEXT SETTINGS ({device.toUpperCase()}) 📄
      </Typography>

      <TextField
        label="Font Size"
        fullWidth
        placeholder="16px"
        value={currentStyle.fontSize || ""}
        onChange={(e) => updateStyle("fontSize", e.target.value)}
      />

      <TextField
        label="Line Height (ex: 1.5)"
        fullWidth
        value={currentStyle.lineHeight || ""}
        onChange={(e) => updateStyle("lineHeight", e.target.value)}
      />

      <TextField
        label="Text Color"
        fullWidth
        type="color" // Color picker بسيط من المتصفح
        value={currentStyle.color || "#000000"}
        onChange={(e) => updateStyle("color", e.target.value)}
        sx={{ '& input': { height: '40px' } }}
      />
    </Box>
  );
};