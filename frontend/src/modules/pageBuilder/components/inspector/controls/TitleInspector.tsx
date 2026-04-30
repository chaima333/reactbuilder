
import { Box, TextField, Typography, MenuItem } from "@mui/material";

export const TitleInspector = ({ block, device, onChange }: any) => {
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
      <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
        TITLE SETTINGS ({device.toUpperCase()}) 🖋️
      </Typography>

      {/* التحكم في النص نفسه */}
      <TextField
        label="Title Text"
        fullWidth
        multiline
        value={block.data.props?.content || ""}
        onChange={(e) => onChange({ props: { ...block.data.props, content: e.target.value } })}
      />

      {/* التحكم في الحجم (Responsive) */}
      <TextField
        label="Font Size (ex: 40px, 3rem)"
        fullWidth
        value={currentStyle.fontSize || ""}
        onChange={(e) => updateStyle("fontSize", e.target.value)}
      />

      {/* التحكم في المحاذاة (Responsive) */}
      <TextField
        select
        label="Alignment"
        fullWidth
        value={currentStyle.textAlign || "left"}
        onChange={(e) => updateStyle("textAlign", e.target.value)}
      >
        <MenuItem value="left">Left</MenuItem>
        <MenuItem value="center">Center</MenuItem>
        <MenuItem value="right">Right</MenuItem>
      </TextField>
    </Box>
  );
};