export const normalizeSpacingStyles = (
  styles: Record<string, any>
) => {

  const normalized = {
    ...styles
  };

  // =====================
  // PADDING SHORTHAND
  // =====================

  if (normalized.padding) {

    delete normalized.paddingTop;
    delete normalized.paddingBottom;
    delete normalized.paddingLeft;
    delete normalized.paddingRight;
  }

  // =====================
  // MARGIN SHORTHAND
  // =====================

  if (normalized.margin) {

    delete normalized.marginTop;
    delete normalized.marginBottom;

    if (
      normalized.marginLeft !== "auto"
    ) {
      delete normalized.marginLeft;
    }

    if (
      normalized.marginRight !== "auto"
    ) {
      delete normalized.marginRight;
    }
  }

  return normalized;
};
