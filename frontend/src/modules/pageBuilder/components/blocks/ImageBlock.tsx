import { Box } from '@mui/material';
import { applyStyles } from "../../core/styleEngine";

export const ImageBlock = ({ data }: any) => {
  const styles = applyStyles(data.style);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: data.style?.align || 'center',
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
          objectFit: 'cover'
        }}
      />
    </Box>
  );
};