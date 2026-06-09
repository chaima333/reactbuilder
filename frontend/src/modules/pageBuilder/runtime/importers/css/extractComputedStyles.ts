export const extractComputedStyles = (
  element: HTMLElement
) => {

  const computed =
    (
      element.ownerDocument.defaultView || window
    ).getComputedStyle(
      element
    );

  return {

    // =====================
    // LAYOUT
    // =====================

    display:
      computed.display,

    flexDirection:
      computed.flexDirection,

    justifyContent:
      computed.justifyContent,

    alignItems:
      computed.alignItems,

    gap:
      computed.gap,

    gridTemplateColumns:
      computed.gridTemplateColumns,

    gridTemplateRows:
      computed.gridTemplateRows,

    padding:
      computed.padding,

    margin:
      computed.margin,

    width:
      computed.width,

    maxWidth:
      computed.maxWidth,

    minHeight:
      computed.minHeight,

    position:
      computed.position,

    // =====================
    // VISUAL
    // =====================

    color:
      computed.color,

    backgroundColor:
      computed.backgroundColor,

    background:
      computed.background,

    border:
      computed.border,

    borderRadius:
      computed.borderRadius,

    boxShadow:
      computed.boxShadow,

    backdropFilter:
      computed.backdropFilter,

    opacity:
      computed.opacity,

    // =====================
    // TYPOGRAPHY
    // =====================

    fontSize:
      computed.fontSize,

    fontWeight:
      computed.fontWeight,

    fontFamily:
      computed.fontFamily,

    lineHeight:
      computed.lineHeight,

    letterSpacing:
      computed.letterSpacing,

    textTransform:
      computed.textTransform,

    textAlign:
      computed.textAlign
  };
};
