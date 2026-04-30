import { Box, TextField, Typography } from "@mui/material";

export const ButtonInspector = ({ block, device, onChange }: any) => {
  const currentStyle = block.data.style?.[device] || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" color="primary">
        BUTTON STYLE ({device.toUpperCase()})
      </Typography>

      <TextField
        label="Button Text"
        fullWidth
        value={block.data.props?.label || ""}
        onChange={(e) => onChange({ props: { ...block.data.props, label: e.target.value } })}
      />

      <TextField
        label="Font Size"
        fullWidth
        value={currentStyle.fontSize || ""}
        onChange={(e) => onChange({
          style: {
            ...block.data.style,
            [device]: { ...currentStyle, fontSize: e.target.value }
          }
        })}
      />
      
      {/* مثال لتغيير اللون حسب الجهاز */}
      <TextField
        label="Background Color"
        fullWidth
        value={currentStyle.backgroundColor || ""}
        onChange={(e) => onChange({
          style: {
            ...block.data.style,
            [device]: { ...currentStyle, backgroundColor: e.target.value }
          }
        })}
      />
    </Box>
  );
};