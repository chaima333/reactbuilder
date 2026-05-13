import { ComponentType } from "react";

export type BlockType =
  | "section"
  | "text"
  | "image"
  | "button"
  | "title"
  | "hero";

export type TextAlign =
  | "left"
  | "center"
  | "right";

export interface StyleValue {

  // ========================
  // Layout
  // ========================

  display?: string;

  flexDirection?: string;

  justifyContent?: string;

  alignItems?: string;

  gap?: string | number;

  width?: string | number;

  maxWidth?: string | number;

  minHeight?: string | number;

  // ========================
  // Spacing
  // ========================

  padding?: string | number;

  paddingTop?: string | number;

  paddingBottom?: string | number;

  marginTop?: string | number;

  marginBottom?: string | number;

  // ========================
  // Typography
  // ========================

  textAlign?: TextAlign;

  fontSize?: string | number;

  fontWeight?: string | number;

  lineHeight?: string | number;

  color?: string;

  // ========================
  // Visual
  // ========================

  backgroundColor?: string;

  borderRadius?: string | number;

  border?: string;

  cursor?: string;

  opacity?: number | string;
}


export interface ResponsiveStyle {
  desktop?: Record<string, any>;
  tablet?: Record<string, any>;
  mobile?: Record<string, any>;
  [key: string]: any; 
}

export interface Block {
  id: string;
  type: BlockType;

  data: {
    props: Record<string, any>;
    style: ResponsiveStyle;
  };

  children: Block[];

  meta?: {
    isLocked?: boolean;
    isHidden?: boolean;
    label?: string;
    displayName?: string;
  };
}

export interface PageData {
  id: number;
  siteId: number;
  title: string;
  blocks: Block[];
}

export type BlockField = {
  key: string;
  label: string;
  
  type: "text" | "color" | "select"| "textarea";
  target: "props" | "style";

  options?: {
    label: string;
    value: string;
  }[];

  responsive?: boolean;
};

export type BlockConfig = {
  component: ComponentType<any>;

  label: string;
  
  icon?: React.ReactNode;

  isContainer: boolean;

  fields: BlockField[];

  allowedChildren?: BlockType[];

  defaultData: {
    props: Record<string, any>;
    style: ResponsiveStyle;
  };
};

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

interface HeroAction {
  label: string;
  url: string;
}

interface HeroBlockProps {
  data: {
    props: {
      headline: string;
      subtext: string;

      primaryAction?: HeroAction;
      secondaryAction?: HeroAction;
    };

    style: ResponsiveStyle;
  };

  device?: Device;
}