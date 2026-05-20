import type { Device } from "../../types/page.types";

const LAYOUT_PROPS = [

  "display",

  "gridTemplateColumns",
  "gridTemplateRows",

  "gridColumn",
  "gridRow",

  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",

  "width",
  "minWidth",
  "maxWidth",

  "height",
  "minHeight",
  "maxHeight",

  "position",

  "left",
  "right",
  "top",
  "bottom",

  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink"

];

export const useResolvedStyle = (
  style: any,
  device: Device
) => {

  const desktop =
    style?.desktop || {};

  const tablet =
    style?.tablet || {};

  const mobile =
    style?.mobile || {};

  // =========================
  // DESKTOP
  // =========================

  if (device === "desktop") {

    return desktop;
  }

  // =========================
  // TABLET
  // =========================

  if (device === "tablet") {

    const result = {
      ...desktop,
      ...tablet
    };

    // 🚫 prevent layout leakage
    for (const key of LAYOUT_PROPS) {

      if (
        tablet[key] === undefined
      ) {

        delete result[key];
      }
    }

    return result;
  }

  // =========================
  // MOBILE
  // =========================

  const result = {

    ...desktop,

    ...tablet,

    ...mobile
  };

  // 🚫 prevent desktop physics
  for (const key of LAYOUT_PROPS) {

    if (
      mobile[key] === undefined
    ) {

      delete result[key];
    }
  }

  // ✅ mobile authority defaults

  if (
    result.display === "flex"
  ) {

    result.flexDirection =
      result.flexDirection || "column";

    result.width =
      result.width || "100%";

    result.minWidth =
      result.minWidth || 0;
  }

  return result;
};