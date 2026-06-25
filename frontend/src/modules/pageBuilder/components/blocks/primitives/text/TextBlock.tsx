import { CSSProperties } from "@mui/material/styles/createTypography";
import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntime
} from "../../../../runtime/context/RuntimeProvider";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const TextBlock = ({
  data,
  device
}: any) => {

  // =====================================
  // RUNTIME
  // =====================================

  const context =
    useRuntime();

  // =====================================
  // RESPONSIVE STYLE
  // =====================================

const currentDevice =

  (
    device ||
    "desktop"
  ) as Device;


const resolvedStyle =

useResolvedStyle(
  data?.style,
  currentDevice
);
  // =====================================
  // DEBUG
  // =====================================

  if (
    context.mode ===
    "editor"
  ) {

    console.log(
      "🔥 TEXT BLOCK",
      {
        props:
          data?.props,

        style:
          resolvedStyle
      }
    );

    console.log(
      "🔥 FINAL TEXT STYLE",
      resolvedStyle
    );
  }

  // =====================================
  // CONTENT
  // =====================================
const content =

  data?.props?.text ||

  data?.props?.content ||

  "";

const finalStyle: CSSProperties = {
  ...resolvedStyle,

  width:
    resolvedStyle.width || "100%",

  maxWidth:
    resolvedStyle.maxWidth || "100%",

  minWidth: 0,

  height: "auto",

  overflowWrap: "break-word",

  wordBreak: "normal",

  whiteSpace: "normal",

  lineHeight:
    resolvedStyle.lineHeight || "1.55",

  boxSizing: "border-box",

  cursor:
    resolvedStyle.cursor
};

  // =====================================
  // RENDER
  // =====================================

  return (

  <div
    style={finalStyle}
  >

    {content}

  </div>
);
};
