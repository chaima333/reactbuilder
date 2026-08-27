import type { CSSProperties } from "react";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";
import { tokens } from "../../../../core/theme/tokens";

type Device = "desktop" | "tablet" | "mobile";


const resolveColorToken = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const tokenValue = (tokens.colors as Record<string, unknown>)[value];
  return typeof tokenValue === "string" ? tokenValue : value;
};

const resolveTypographyToken = (value: unknown) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const tokenValue = (tokens.typography as Record<string, Record<string, unknown>>)[value];
  return tokenValue && typeof tokenValue === "object" ? tokenValue : undefined;
};

const isInvisibleColor = (value: unknown) => {
  const normalized = String(value || "").replace(/\s+/g, "").toLowerCase();
  return (
    normalized === "transparent" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

const isHiddenOpacity = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return false;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric <= 0.05;
};

// ========================
// Composant Principal
// ========================
export const TextBlock = ({ data, device }: any) => {
  const currentDevice = (device || "desktop") as Device;
  const resolvedStyle = useResolvedStyle(data?.style, currentDevice) as CSSProperties;

  const content = data?.props?.content  || data?.props?.text  || "";
  const isKpiNumber = data?.props?.semanticRole === "kpiNumber";
  const kpiFontSize = currentDevice === "mobile" ? "34px" : currentDevice === "tablet" ? "40px" : "48px";

  // ✅ Résoudre les tokens
  const typographyToken = resolveTypographyToken(resolvedStyle.fontSize);
  const resolvedColor = resolveColorToken(resolvedStyle.color);

  const finalStyle: CSSProperties = {
    ...resolvedStyle,

    // ✅ Font Family
    fontFamily: resolvedStyle.fontFamily || tokens.fonts.sans,

    // ✅ Typography avec `as any` pour éviter les erreurs TypeScript
    fontSize: isKpiNumber
      ? kpiFontSize
      : (typographyToken as any)?.fontSize ||
        resolvedStyle.fontSize ||
        tokens.typography.bodyMD.fontSize,

    fontWeight: isKpiNumber
      ? undefined
      : (typographyToken as any)?.fontWeight ||
        resolvedStyle.fontWeight ||
        tokens.typography.bodyMD.fontWeight,

    letterSpacing: isKpiNumber
      ? undefined
      : (typographyToken as any)?.letterSpacing ||
        resolvedStyle.letterSpacing ||
        (tokens.typography.bodyMD as any).letterSpacing || undefined,

    lineHeight: isKpiNumber
      ? "1"
      : (typographyToken as any)?.lineHeight ||
        resolvedStyle.lineHeight ||
        tokens.typography.bodyMD.lineHeight,

    // ✅ Opacity & Visibility
    opacity: isHiddenOpacity(resolvedStyle.opacity) ? 1 : resolvedStyle.opacity,
    visibility: resolvedStyle.visibility === "hidden" ? "visible" : resolvedStyle.visibility,

    // ✅ Color
    color: isInvisibleColor(resolvedColor)
      ? tokens.colors.muted
      : resolvedColor || tokens.colors.muted,

    // ✅ WebkitTextFillColor avec resolvedColor
    WebkitTextFillColor: isInvisibleColor((resolvedStyle as any).WebkitTextFillColor)
      ? resolvedColor || "currentColor"
      : (resolvedStyle as any).WebkitTextFillColor,

    backgroundClip: isInvisibleColor((resolvedStyle as any).WebkitTextFillColor)
      ? undefined
      : (resolvedStyle as any).backgroundClip,

    WebkitBackgroundClip: isInvisibleColor((resolvedStyle as any).WebkitTextFillColor)
      ? undefined
      : (resolvedStyle as any).WebkitBackgroundClip,

    // ✅ Layout
    width: isKpiNumber ? "auto" : resolvedStyle.width || "100%",
    maxWidth: isKpiNumber ? "none" : resolvedStyle.maxWidth || "100%",
    minWidth: isKpiNumber ? "auto" : resolvedStyle.minWidth ?? 0,
    height: resolvedStyle.height || "auto",
    overflow: resolvedStyle.overflow || "visible",

    // ✅ Text Wrapping
    overflowWrap: isKpiNumber ? "normal" : resolvedStyle.overflowWrap || "break-word",
    wordBreak: isKpiNumber ? "keep-all" : resolvedStyle.wordBreak || "normal",
    whiteSpace: isKpiNumber ? "nowrap" : resolvedStyle.whiteSpace || "normal",
    hyphens: resolvedStyle.hyphens || "none",

    // ✅ Box Sizing
    boxSizing: resolvedStyle.boxSizing || "border-box",
    cursor: resolvedStyle.cursor
  };

  return <div style={finalStyle}>{content}</div>;
};