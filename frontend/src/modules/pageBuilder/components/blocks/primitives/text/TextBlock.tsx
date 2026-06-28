import type {
  CSSProperties
} from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const TextBlock = ({
  data,
  device
}: any) => {
  const currentDevice =
    (
      device ||
      "desktop"
    ) as Device;

  const resolvedStyle =
    useResolvedStyle(
      data?.style,
      currentDevice
    ) as CSSProperties;

  const content =
    data?.props?.text ||
    data?.props?.content ||
    "";

  const isKpiNumber =
    data?.props?.semanticRole ===
    "kpiNumber";

  const kpiFontSize =
    currentDevice === "mobile"
      ? "34px"
      : currentDevice === "tablet"
        ? "40px"
        : "48px";

  const finalStyle: CSSProperties = {
    ...resolvedStyle,

    fontSize:
      isKpiNumber
        ? kpiFontSize
        : resolvedStyle.fontSize,

    width:
      isKpiNumber
        ? "auto"
        : resolvedStyle.width || "100%",

    maxWidth:
      isKpiNumber
        ? "none"
        : resolvedStyle.maxWidth || "100%",

    minWidth:
      isKpiNumber
        ? "auto"
        : resolvedStyle.minWidth ?? 0,

    height:
      resolvedStyle.height || "auto",

    overflow:
      resolvedStyle.overflow || "visible",

    overflowWrap:
      isKpiNumber
        ? "normal"
        : resolvedStyle.overflowWrap || "break-word",

    wordBreak:
      isKpiNumber
        ? "keep-all"
        : resolvedStyle.wordBreak || "normal",

    whiteSpace:
      isKpiNumber
        ? "nowrap"
        : resolvedStyle.whiteSpace || "normal",

    hyphens:
      resolvedStyle.hyphens || "none",

    lineHeight:
      isKpiNumber
        ? "1"
        : resolvedStyle.lineHeight || "1.55",

    boxSizing:
      resolvedStyle.boxSizing || "border-box",

    cursor:
      resolvedStyle.cursor
  };

  return (
    <div
      style={finalStyle}
    >
      {content}
    </div>
  );
};