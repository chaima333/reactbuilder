import { Box } from '@mui/material';
import { useResolvedStyle } from "../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

export const ImageBlock = ({ data, device }: any) => {
  const styles = useResolvedStyle(data.style, (device || "desktop") as Device);

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
          borderColor: styles.borderColor
        }}
      />
    </Box>
  );
};
