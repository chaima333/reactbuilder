export const applyStyles = (style: any = {}) => {
  return {
    fontSize: style.fontSize,
    color: style.color,
    background: style.background,
    padding: style.padding,
    margin: style.margin,
    borderRadius: style.borderRadius,
    textAlign: style.align
  };
};