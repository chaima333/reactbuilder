
const getNestedValue = (obj: any, path: string) => {
  const cleanPath = path.replace(/var\(|\)/g, "");
  return cleanPath.split(".").reduce((acc, key) => acc?.[key], obj);
};

export const resolveToken = (value: any, tokens: any) => {
  if (typeof value !== "string") return value;

  const colorValue = getNestedValue(tokens.colors, value);
  if (colorValue) return colorValue;

  if (tokens.spacing && tokens.spacing[value]) {
    return tokens.spacing[value];
  }

  const typeValue = getNestedValue(tokens.typography, value);
  if (typeValue) return typeValue;

  return value;
};

export const resolveStyle = (style: any, tokens: any) => {
  if (!style || !tokens) return style || {};

  const resolved: any = {};

  Object.keys(style).forEach((key) => {
    resolved[key] = resolveToken(style[key], tokens);
  });

  return resolved;
};