import { Button, Box } from '@mui/material';
import { useTheme } from "../../core/theme/ThemeProvider";
import { applyStyles } from "../../core/styleEngine";

export const ButtonBlock = ({ data, preview, device }: any) => {
  const { tokens } = useTheme();
  const styles = applyStyles(data.style, device, tokens);
  
  const containerStyles = { 
    textAlign: styles.textAlign || 'center',
    py: 1 
  };

  return (
    <Box sx={containerStyles}>
      <Button 
        variant={data.style?.variant || 'contained'}
        style={{
          ...styles,
          textTransform: 'none', // باش يحافظ على شكل الـ Font
          fontFamily: tokens.typography.fontFamily,
        }}
        href={data.props?.url}
        target="_blank"
        disabled={!preview}
      >
        {data.props?.label || "Button"}
      </Button>
    </Box>
  );
};