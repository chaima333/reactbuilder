import { Box }
from "@mui/material";

import { useResolvedStyle }
from "../../../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

const resolveAlignment = (
  align?: string
) => {

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

export const ImageBlock = ({
  data,
  device
}: any) => {

  const styles =
    useResolvedStyle(
      data?.style || {},
      (device || "desktop") as Device
    );

  return (

    <Box
      sx={{

        display:
          "flex",

        justifyContent:
          resolveAlignment(
            styles.textAlign
          ),

        width:
          "100%"
      }}
    >

      <img
        src={
          data?.props?.url ||
          "https://via.placeholder.com/400x220"
        }

        alt={
          data?.props?.alt ||
          "Image"
        }

        style={{

          // 👑 RUNTIME AUTHORITY
          width:
            "100%",

          height:
            "220px",

          objectFit:
            "cover",

          display:
            "block",

          // 👑 SAFE VISUAL TOKENS
          borderRadius:
            styles.borderRadius || "12px",

          boxSizing:
            "border-box"
        }}
      />

    </Box>
  );
};