import { Box } from '@mui/material';
import { useTheme } from "../../core/theme/ThemeProvider";
import { applyStyles } from "../../core/styleEngine";

export const ImageBlock = ({ data, device }: any) => {
  const { tokens } = useTheme();
  const styles = applyStyles(data.style, device, tokens);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: styles.textAlign || 'center', 
        py: 2
      }}
    >
      <img 
        src={data.props?.url || "https://via.placeholder.com/400x200"}
        alt={data.props?.alt || "Image"}
        style={{
          ...styles,
          maxWidth: '100%',
          height: 'auto',
          objectFit: 'cover',
          // لو تحب تزيد border مربوط بالـ tokens أوتوماتيكياً
          borderColor: styles.borderColor || tokens.colors.border.default 
        }}
      />
    </Box>
  );
};