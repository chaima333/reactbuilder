import type { CSSProperties } from "react";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";
import { tokens } from "../../../../core/theme/tokens";

type Device = "desktop" | "tablet" | "mobile";

type ResolvedStyleInput = NonNullable<Parameters<typeof useResolvedStyle>[0]>;

type TitleSegment = {
  text?: string;
  variant?: string;
  style?: {
    backgroundImage?: string;
  };
};

type TitleLevel =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

type TitleBlockData = {
  props?: {
    content?: string;
    segments?: TitleSegment[];
    level?: TitleLevel;
  };
  style?: ResolvedStyleInput;
};

type TitleBlockProps = {
  data?: TitleBlockData;
  device?: Device;
};

const isInvisibleColor = (value: unknown): boolean => {
  const normalized = String(value ?? "").replace(/\s+/g, "").toLowerCase();
  return (
    normalized === "transparent" ||
    normalized === "rgba(0,0,0,0)" ||
    normalized === "rgb(0,0,0,0)"
  );
};

const isHiddenOpacity = (value: unknown): boolean => {
  if (value === undefined || value === null || value === "") {
    return false;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric <= 0.05;
};

const normalizeText = (value: unknown): string => {
  return String(value ?? "").replace(/\s+/g, " ").trim();
};

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

// ========================
// Composant Principal
// ========================
export const TitleBlock = ({ data, device = "desktop" }: TitleBlockProps) => {
  const styleInput: ResolvedStyleInput = data?.style ?? ({} as ResolvedStyleInput);
  const resolvedStyle = useResolvedStyle(styleInput, device) as CSSProperties;

  // Résoudre les tokens
  const typographyToken = resolveTypographyToken(resolvedStyle.fontSize);
  const resolvedColor = resolveColorToken(resolvedStyle.color);

  const content = data?.props?.content || "Title Text Content";
  const segments: TitleSegment[] = Array.isArray(data?.props?.segments) ? data.props.segments : [];
  
  // Récupérer le niveau du heading
  const level: TitleLevel = data?.props?.level || "h2";
  const HeadingTag = level;

  const fallbackTypography =
  level === "h1" ||
  level === "h2"
    ? tokens.typography.headingXL
    : undefined;

  const segmentsContent = segments.map((segment) => segment.text || "").join("");
  const shouldRenderSegments =
    segments.length > 0 && normalizeText(segmentsContent) === normalizeText(content);

  // Gérer les marges
  const hasMargin =
    resolvedStyle.margin !== undefined ||
    resolvedStyle.marginTop !== undefined ||
    resolvedStyle.marginBottom !== undefined ||
    resolvedStyle.marginLeft !== undefined ||
    resolvedStyle.marginRight !== undefined;

  const textFillColor = resolvedStyle.WebkitTextFillColor;
  const hasInvisibleTextFill = isInvisibleColor(textFillColor);

  // Style final
  const finalStyle: CSSProperties = {
    ...resolvedStyle,

    // Font Family
    fontFamily: resolvedStyle.fontFamily || tokens.fonts.sans,

    // Typographie avec fallback basé sur le niveau
    fontSize:
      (typographyToken?.fontSize as CSSProperties["fontSize"]) ??
      resolvedStyle.fontSize ??
      (fallbackTypography?.fontSize as CSSProperties["fontSize"]),

    fontWeight:
      (typographyToken?.fontWeight as CSSProperties["fontWeight"]) ??
      resolvedStyle.fontWeight ??
      (fallbackTypography?.fontWeight as CSSProperties["fontWeight"]),

    letterSpacing:
      (typographyToken?.letterSpacing as CSSProperties["letterSpacing"]) ??
      resolvedStyle.letterSpacing ??
      (fallbackTypography?.letterSpacing as CSSProperties["letterSpacing"]),

    lineHeight:
      (typographyToken?.lineHeight as CSSProperties["lineHeight"]) ??
      resolvedStyle.lineHeight ??
      (fallbackTypography?.lineHeight as CSSProperties["lineHeight"]),

    // Opacity & Visibility
    opacity: isHiddenOpacity(resolvedStyle.opacity) ? 1 : resolvedStyle.opacity,
    visibility: resolvedStyle.visibility === "hidden" ? "visible" : resolvedStyle.visibility,

    // Color
    color: isInvisibleColor(resolvedColor)
      ? tokens.colors.text
      : resolvedColor || tokens.colors.text,

    // WebkitTextFillColor avec resolvedColor
    WebkitTextFillColor: hasInvisibleTextFill
      ? resolvedColor || "currentColor"
      : textFillColor,

    backgroundClip: hasInvisibleTextFill ? undefined : resolvedStyle.backgroundClip,
    WebkitBackgroundClip: hasInvisibleTextFill ? undefined : resolvedStyle.WebkitBackgroundClip,

    // Layout
    width: resolvedStyle.width || "auto",
    maxWidth: resolvedStyle.maxWidth || "100%",
    display: resolvedStyle.display || "block",
    minWidth: 0,

    // Margins
    margin: hasMargin ? resolvedStyle.margin : 0,
    marginTop: resolvedStyle.margin !== undefined ? undefined : resolvedStyle.marginTop,
    marginBottom: resolvedStyle.margin !== undefined ? undefined : resolvedStyle.marginBottom,
    marginLeft: resolvedStyle.margin !== undefined ? undefined : resolvedStyle.marginLeft,
    marginRight: resolvedStyle.margin !== undefined ? undefined : resolvedStyle.marginRight,

    overflowWrap: "break-word",
    wordBreak: "normal",
    overflow: "visible",
    whiteSpace: "normal",
    boxSizing: "border-box"
  };

  return (
    <HeadingTag style={finalStyle}>
      {shouldRenderSegments
        ? segments.map((segment, index) => {
            const isAccent = segment.variant === "accent";

            const segmentStyle: CSSProperties = isAccent
              ? {
                  background:
                    segment.style?.backgroundImage && segment.style.backgroundImage !== "none"
                      ? segment.style.backgroundImage
                      : `linear-gradient(90deg, ${tokens.colors.primary}, ${tokens.colors.secondary})`,

                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }
              : {
                  color: finalStyle.color || "currentColor",
                  WebkitTextFillColor: finalStyle.color || "currentColor"
                };

            return (
              <span key={`${index}-${segment.text || ""}`} style={segmentStyle}>
                {segment.text || ""}
              </span>
            );
          })
        : content}
    </HeadingTag>
  );
};