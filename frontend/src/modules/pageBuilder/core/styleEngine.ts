export const resolveStyle = (style: any, tokens: any) => {
  if (!style || !tokens) return style;
  const resolved = { ...style };

  Object.keys(resolved).forEach((key) => {
    const value = resolved[key];
    // إذا القيمة هي Token (مثلاً: colors.primary)
    if (typeof value === "string" && !value.startsWith("#") && !value.startsWith("rgb")) {
      const tokenValue = value.split('.').reduce((obj, i) => obj?.[i], tokens);
      if (tokenValue) resolved[key] = tokenValue;
    }
  });
  return resolved;
};

export const applyStyles = (styleData: any, device: string, tokens: any) => {
  if (!styleData) return {};
  const desktop = styleData.desktop || {};
  const tablet = styleData.tablet || {};
  const mobile = styleData.mobile || {};

  let activeStyle = desktop;
  if (device === "tablet") activeStyle = { ...desktop, ...tablet };
  if (device === "mobile") activeStyle = { ...desktop, ...tablet, ...mobile };

  return resolveStyle(activeStyle, tokens);
};