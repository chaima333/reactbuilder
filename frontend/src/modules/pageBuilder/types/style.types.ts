// src/modules/pageBuilder/types/style.types.ts

// ========================
// Raw CSS Escape Hatches
// ========================
export type RawCssSize =
  | `${number}px`
  | `${number}rem`
  | `${number}%`
  | `${number}vh` 
  | `${number}vw` 
  | "auto";

export type RawColorValue =
  | `#${string}`
  | `rgb(${string})`
  | `rgba(${string})`;

// ========================
// Theme Tokens
// ========================

export type ColorToken =
  | "primary"
  | "surface"
  | "muted"
  | "text"
  | "border";

export type SpacingToken =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export type TypographyToken =
  | "displayXL"
  | "displayLG"
  | "bodyLG"
  | "bodyMD";

export type RadiusToken =
  | "sm"
  | "md"
  | "lg";

// ========================
// Layout Contracts
// ========================
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse";
export type ObjectFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export type GridElementSpan = `span ${number}` | "auto" | string;

export type DisplayValue =
  | "block"
  | "flex"
  | "grid"
  | "inline-flex"
  | "none";

export type FlexDirection =
  | "row"
  | "column"
  | "row-reverse"
  | "column-reverse";

export type AlignItems =
  | "stretch"
  | "center"
  | "flex-start"
  | "flex-end";

export type JustifyContent =
  | "flex-start"
  | "center"
  | "flex-end"
  | "space-between"
  | "space-around"
  | "space-evenly";

// ========================
// Typography Contracts
// ========================

export type TextAlign =
  | "left"
  | "center"
  | "right"
  | "justify";

// ========================
// Layout Styles
// ========================

export interface LayoutStyles {

  display?: DisplayValue;
  flex?: string | number;

  flexDirection?: FlexDirection;

  alignItems?: AlignItems;

  justifyContent?: JustifyContent;

  width?: RawCssSize;

  minWidth?: RawCssSize;

  maxWidth?: RawCssSize;

  height?: RawCssSize;

  minHeight?: RawCssSize;

  maxHeight?: RawCssSize;

  flexWrap?: FlexWrap;
}

// ========================
// Spacing Styles
// ========================


export interface SpacingStyles {
  padding?: SpacingToken | RawCssSize;
  paddingTop?: SpacingToken | RawCssSize;
  paddingBottom?: SpacingToken | RawCssSize;
  paddingLeft?: SpacingToken | RawCssSize;   // ✨ زيد هذي
  paddingRight?: SpacingToken | RawCssSize;  // ✨ زيد هذي
  
  margin?: SpacingToken | RawCssSize;
  marginTop?: SpacingToken | RawCssSize;     // ✨ زيد هذي
  marginBottom?: SpacingToken | RawCssSize;  // ✨ زيد هذي
  marginLeft?: SpacingToken | RawCssSize;    // ✨ زيد هذي (باش تمشي auto)
  marginRight?: SpacingToken | RawCssSize;   // ✨ زيد هذي (باش تمشي auto)
  
  gap?: SpacingToken | RawCssSize;
}

// ========================
// Typography Styles
// ========================

export interface TypographyStyles {

  fontSize?:
    | TypographyToken
    | RawCssSize;

  textAlign?: TextAlign;
  lineHeight?: string | number;
  color?:
    | ColorToken
    | RawColorValue;

  fontWeight?:
    | string
    | number;
}

// ========================
// Visual Styles
// ========================

export interface VisualStyles {

  backgroundColor?:
    | ColorToken
    | RawColorValue;

  borderRadius?:
    | RadiusToken
    | RawCssSize;

  border?: string;

  borderColor?:
    | ColorToken
    | RawColorValue;

  opacity?:
    | number
    | string;

  objectFit?: ObjectFit;

  // 👇 ZID HETHI
  cursor?: string;
}

// ========================
// Final Style Object
// ========================

export interface StyleObject
  extends
    LayoutStyles,
    SpacingStyles,
    GridStyles,
    TypographyStyles,
    VisualStyles {}

export type StyleValue = StyleObject;

// ========================
// Responsive Runtime
// ========================

export interface ResponsiveStyle {

  desktop?: StyleObject;

  tablet?: StyleObject;

  mobile?: StyleObject;
}

// ========================
// Grid Styles 👑
// ========================
export interface GridStyles {
  columns?: number;                     
  gridTemplateColumns?: string;          
  gridColumn?: GridElementSpan;        
  gridRow?: GridElementSpan;            
}

