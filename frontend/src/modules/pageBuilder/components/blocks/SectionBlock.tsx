import React from "react";

import {
  useResolvedStyle,
} from "../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const SectionBlock = ({
  children,
  data,
  device,
}: any) => {

  const resolvedStyle =
    useResolvedStyle(
      data?.style,
      (
        device ||
        "desktop"
      ) as Device
    );

  return (

    <div
      style={{

        width: "100%",

        minHeight:
          resolvedStyle
            .minHeight
          || "120px",

        display:
          resolvedStyle
            .display
          || "flex",

        flexDirection:
          resolvedStyle
            .flexDirection
          || "column",

        justifyContent:
          resolvedStyle
            .justifyContent
          || "flex-start",

        alignItems:
          resolvedStyle
            .alignItems
          || "stretch",

        gap:
          resolvedStyle
            .gap
          || "16px",

        paddingTop:
          resolvedStyle
            .paddingTop
          || "20px",

        paddingBottom:
          resolvedStyle
            .paddingBottom
          || "20px",

        backgroundColor:
          resolvedStyle
            .backgroundColor
          || "transparent",

        border:
          resolvedStyle
            .border
          || "1px dashed #ccc",

        borderRadius:
          resolvedStyle
            .borderRadius
          || "0px",

        boxSizing:
          "border-box",

        overflow:
          "hidden",

        position:
          "relative",
      }}
    >

      {children}

    </div>
  );
};