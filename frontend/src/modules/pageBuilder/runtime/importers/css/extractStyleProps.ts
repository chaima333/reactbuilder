// frontend/src/modules/pageBuilder/runtime/importers/html/css/extractStyleProps.ts

import { sanitizeExtractedStyles }
from "./sanitizeExtractedStyles";

export interface ExtractedStyle {
  desktop: Record<string, string>;
}

// =========================
// RGB → HEX
// =========================

function rgbToHex(
  rgbStr: string
): string {

  if (
    !rgbStr ||
    !rgbStr.startsWith("rgb")
  ) {
    return rgbStr;
  }

  const match =
    rgbStr.match(/\d+/g);

  if (
    !match ||
    match.length < 3
  ) {
    return rgbStr;
  }

  const r = parseInt(match[0]);
  const g = parseInt(match[1]);
  const b = parseInt(match[2]);

  return (
    "#" +
    (
      (1 << 24) +
      (r << 16) +
      (g << 8) +
      b
    )
      .toString(16)
      .slice(1)
  );
}

// =========================
// Normalize Font Weight
// =========================

function normalizeFontWeight(
  weight: string
): string {

  if (!weight) {
    return "normal";
  }

  if (
    weight === "700" ||
    weight === "bold"
  ) {
    return "bold";
  }

  if (
    weight === "400" ||
    weight === "normal"
  ) {
    return "normal";
  }

  return weight;
}

// =========================
// Normalize Font Size
// =========================

function normalizeFontSize(
  size: string
): string {

  const parsed =
    parseInt(size);

  if (isNaN(parsed)) {
    return "16px";
  }

  if (parsed > 40) {
    return "40px";
  }

  return `${parsed}px`;
}

// =========================
// Extract Style Props
// =========================

export const extractStyleProps = (
  element: HTMLElement
): ExtractedStyle => {

  const computed =
    window.getComputedStyle(
      element
    );

  return {

    desktop:
      sanitizeExtractedStyles({

        // =====================
        // SPACING
        // =====================

        paddingTop:
          computed.paddingTop,

        paddingBottom:
          computed.paddingBottom,

        paddingLeft:
          computed.paddingLeft,

        paddingRight:
          computed.paddingRight,

        marginTop:
          computed.marginTop,

        marginBottom:
          computed.marginBottom,

        // =====================
        // COLORS
        // =====================

        backgroundColor:
          rgbToHex(
            computed.backgroundColor
          ),

        color:
          rgbToHex(
            computed.color
          ),

        // =====================
        // TYPOGRAPHY
        // =====================

        fontSize:
          normalizeFontSize(
            computed.fontSize
          ),

        fontWeight:
          normalizeFontWeight(
            computed.fontWeight
          ),

        textAlign:
          computed.textAlign,

        lineHeight:
          computed.lineHeight === "normal"
            ? "1.6"
            : computed.lineHeight,

        // =====================
        // VISUALS
        // =====================

        borderRadius:
          computed.borderRadius
      })
  };
};