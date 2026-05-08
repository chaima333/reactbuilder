export type BlockType =
  | "section"
  | "text"
  | "image"
  | "button"
  | "title"
  | "gallery"
  | "video";


  
export interface Block {
  id: string;
  type: BlockType;
  // خرجناهم مالـ "data" باش يولو أسهل في الـ Access
  props: Record<string, any>; 
  style: ResponsiveStyle;
  children: Block[];
  // زِد هذي مستقبلاً للـ Settings الخاصّة بالـ Engine
  meta?: {
    isLocked?: boolean;
    isHidden?: boolean;
    label?: string; // إسم الـ Block في الـ Layer Tree
  };
}

export interface PageData {
  id: number;
  siteId: number;
  title: string;
  blocks: Block[];
}


// blockRegistry.types.ts
import { ComponentType } from "react";

export type StyleValue = Record<string, any>;

export type ResponsiveStyle = {
  desktop: StyleValue;
  tablet?: StyleValue;
  mobile?: StyleValue;
};

export type BlockField = {
  key: string;
  label: string;
  type: "text" | "color" | "select";
  target: "props" | "style";
  options?: string[];
  responsive?: boolean;
};

export type BlockConfig = {
  component: ComponentType<any>;
  label: string;
  isContainer: boolean;
  fields: BlockField[];
  allowedChildren?: BlockType[];

  defaultData: {
    props: Record<string, any>;
    style: ResponsiveStyle;
  };
};