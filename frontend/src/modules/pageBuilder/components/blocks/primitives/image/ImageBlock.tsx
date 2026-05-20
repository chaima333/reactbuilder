import { Box } from "@mui/material";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

const resolveAlignment = (align?: string) => {
  switch (align) {
    case "left":
      return "flex-start";
    case "right":
      return "flex-end";
    case "center":
    default:
      return "center";
  }
};

export const ImageBlock = ({ data, device }: any) => {
  const styles = useResolvedStyle(
    data?.style || {},
    (device || "desktop") as Device
  ) as any;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: resolveAlignment(styles.textAlign),
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        // 👑 ضربة الأمان: الماوس تخترق البلوك وتمشي للـ Container
        pointerEvents: "none" 
      }}
    >
      <img
        src={data?.props?.url || "https://via.placeholder.com/400x220"}
        alt={data?.props?.alt || "Image"}
        style={{
          width: "100%",
          height: styles.height || "200px", 
          objectFit: "cover",
          display: "block",
          maxWidth: "100%",
          borderRadius: styles.borderRadius || "12px",
          boxSizing: "border-box"
        }}
      />
    </Box>
  );
};