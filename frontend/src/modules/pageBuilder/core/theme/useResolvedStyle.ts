// src/modules/pageBuilder/core/theme/useResolvedStyle.ts
import { useTheme } from "./ThemeProvider"; // استعملنا useTheme اللي في التصويرة متاعك
import { resolveToken } from "./themeResolver"; // ثبت من اسم الملف (resolver) عندك

export const useResolvedStyle = (
  style: any,
  device: "desktop" | "tablet" | "mobile"
) => {
  const { tokens } = useTheme();

  // 🔥 تطوير الـ Fallback (الوراثة)
  // الموبايل ياخذ من التابلت، والتابلت ياخذ من الديستكوب أوتوماتيكياً
  const getDeviceStyle = () => {
    const desktop = style?.desktop || {};
    const tablet = style?.tablet || {};
    const mobile = style?.mobile || {};

    if (device === "mobile") {
      return { ...desktop, ...tablet, ...mobile };
    }
    if (device === "tablet") {
      return { ...desktop, ...tablet };
    }
    return desktop;
  };

  const activeRawStyle = getDeviceStyle();
  const resolved: any = {};

  Object.keys(activeRawStyle).forEach((key) => {
    const value = activeRawStyle[key];

    if (typeof value === "string") {
      // نترجمو الـ Token لقيمة حقيقية (Hex/Pixels)
      resolved[key] = resolveToken(value, tokens);
    } else {
      resolved[key] = value;
    }
  });

  return resolved;
};