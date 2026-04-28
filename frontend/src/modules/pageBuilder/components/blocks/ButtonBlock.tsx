import { Button, Box } from '@mui/material';
import { applyStyles } from "../../core/styleEngine";

export const ButtonBlock = ({ data, preview }: any) => {
  const containerStyles = { textAlign: data.style?.align || 'center' };
  const buttonStyles = applyStyles(data.style);

  return (
    <Box sx={containerStyles}>
      <Button 
        variant={data.style?.variant || 'contained'}
        style={buttonStyles}
        href={data.props?.url}
        target="_blank"
      >
        {data.props?.label || "Button"}
      </Button>
    </Box>
  );
};