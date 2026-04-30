import { Box, TextField, Typography } from "@mui/material";


export const TextInspector = ({ block, device, onChange }: any) => {
  // نجيبو الـ style الخاص بالـ device الحالي فقط
  const currentStyle = block.data.style?.[device] || {};

  return (
    <Box>
      <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
        Editing Style for: {device.toUpperCase()} 📱
      </Typography>
      
      <TextField
        label={`Font Size (${device})`}
        fullWidth
        value={currentStyle.fontSize || ""}
        onChange={(e) => onChange({
          style: {
            ...block.data.style,
            [device]: { ...currentStyle, fontSize: e.target.value }
          }
        })}
      />
    </Box>
  );
};