// figma.types.ts


export type FigmaDocument = {
  name?: string;
  document: FigmaNode;
};

export type FigmaNode = {
  id: string;
  name: string;
  type: FigmaNodeType;
  children?: FigmaNode[];
  imageBase64?: string;
imageMimeType?: string;
imageUrl?: string;
  

  // Layout
  layoutMode?: "HORIZONTAL" | "VERTICAL" | "NONE";
  primaryAxisAlignItems?: "MIN" | "CENTER" | "MAX" | "SPACE_BETWEEN";
  counterAxisAlignItems?: "MIN" | "CENTER" | "MAX";
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  itemSpacing?: number;       // gap
  
  // Dimensions
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  
  // Styles
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  cornerRadius?: number;
  opacity?: number;
  
  // Text
  characters?: string;        // contenu texte
  style?: FigmaTextStyle;
  
  // Component
  componentId?: string;
  mainComponent?: FigmaNode;
};

type FigmaNodeType =
  | "DOCUMENT" | "CANVAS" | "FRAME"
  | "GROUP"    | "TEXT"   | "RECTANGLE"
  | "ELLIPSE"  | "VECTOR" | "COMPONENT"
  | "INSTANCE" | "SECTION";

type FigmaTextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeightPx: number;
  letterSpacing: number;
  textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textDecoration?: "NONE" | "UNDERLINE" | "STRIKETHROUGH";
};

type FigmaFill = {
  type: "SOLID" | "GRADIENT_LINEAR" | "IMAGE";
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
  color?: { r: number; g: number; b: number; a?: number };
  imageRef?: string;
  gradientStops?: Array<{
    color: { r: number; g: number; b: number; a?: number };
    position: number;
  }>;
};
type FigmaStroke = {
  type: "SOLID";
  visible?: boolean;
  opacity?: number;
  blendMode?: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
};