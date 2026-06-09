import {
  Box
} from "@mui/material";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

// =====================================
// ALIGNMENT
// =====================================

const resolveAlignment = (
  align?: string
) => {

  switch (align) {

    case "flex-start":

    case "left":

      return "flex-start";

    case "flex-end":

    case "right":

      return "flex-end";

    case "center":

    default:

      return "center";
  }
};

// =====================================
// COMPONENT
// =====================================

export const ImageBlock = ({
  data,
  device
}: any) => {

  // =====================================
  // RESOLVED STYLE
  // =====================================

  const styles =
    useResolvedStyle(
      data?.style || {},
      (
        device ||
        "desktop"
      ) as Device
    ) as any;

  // =====================================
  // NO IMAGE
  // =====================================

  if (
    !data?.props?.url
  ) {

    return null;
  }

  // =====================================
  // RENDER
  // =====================================

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
          "100%",

        minWidth:
          0,

        overflow:
          "hidden",

        pointerEvents:
          "none"
      }}
    >

      <img
        src={
          data.props.url
        }

        alt={
          data?.props?.alt ||
          "Image"
        }

        style={{

          width:
            styles.width ||
            "100%",

          height:
            styles.height ||
            "200px",

          objectFit:
            styles.objectFit ||
            "cover",

          display:
            "block",

          maxWidth:
            "100%",

          borderRadius:
            styles.borderRadius ||
            "12px",

          boxSizing:
            "border-box"
        }}
      />

    </Box>
  );
};