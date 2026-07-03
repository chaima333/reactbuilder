export const extractComputedStyles = (
  element: HTMLElement,
  pseudo?: "::before" | "::after"
) => {

  const computed =
    (
      element.ownerDocument.defaultView || window
    ).getComputedStyle(
      element,
      pseudo as any
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

    flexWrap:
      computed.flexWrap,

    gap:
      computed.gap,

    gridTemplateColumns:
      computed.gridTemplateColumns,

    gridTemplateRows:
      computed.gridTemplateRows,

    padding:
      computed.padding,

    paddingTop:
      computed.paddingTop,

    paddingBottom:
      computed.paddingBottom,

    paddingLeft:
      computed.paddingLeft,

    paddingRight:
      computed.paddingRight,

    margin:
      computed.margin,

    marginLeft:
      computed.marginLeft,

    marginRight:
      computed.marginRight,

    width:
      computed.width,

    maxWidth:
      computed.maxWidth,

    minWidth:
      computed.minWidth,

    minHeight:
      computed.minHeight,

    position:
      computed.position,

    top:
      computed.top,

    right:
      computed.right,

    bottom:
      computed.bottom,

    left:
      computed.left,

    content:
      computed.content,

    visibility:
      computed.visibility,

    alignSelf:
      computed.alignSelf,

    boxSizing:
      computed.boxSizing,

 // =====================
// VISUAL
// =====================

color:
  computed.color,

backgroundColor:
  computed.backgroundColor,

background:
  computed.background,

backgroundImage:
  computed.backgroundImage,

backgroundSize:
  computed.backgroundSize,

backgroundPosition:
  computed.backgroundPosition,

backgroundRepeat:
  computed.backgroundRepeat,

border:
  computed.border,

borderRadius:
  computed.borderRadius,

boxShadow:
  computed.boxShadow,

    listStyleType:
      computed.listStyleType,

    listStyleImage:
      computed.listStyleImage,

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
