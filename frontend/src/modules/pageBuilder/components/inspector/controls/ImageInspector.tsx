import { Box, TextField, Typography } from "@mui/material";

export const ImageInspector = ({ block, device, onChange }: any) => {
  const currentStyle = block.data.style?.[device] || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" color="primary">
        IMAGE STYLE ({device.toUpperCase()})
      </Typography>

      <TextField
        label="Image URL"
        fullWidth
        value={block.data.props?.url || ""}
        onChange={(e) => onChange({ props: { ...block.data.props, url: e.target.value } })}
      />

      {/* الـ Alignment يتبدل حسب الجهاز */}
      <TextField
        label="Align (flex-start, center, flex-end)"
        fullWidth
        value={currentStyle.textAlign || "center"}
        onChange={(e) => onChange({
          style: {
            ...block.data.style,
            [device]: { ...currentStyle, textAlign: e.target.value }
          }
        })}
      />
    </Box>
  );
};