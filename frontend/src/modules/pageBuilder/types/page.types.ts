// src/modules/pageBuilder/types/page.types.ts

import React from "react";

// 🔄 Re-exporting everything to be the main Hub
export type { 
  FieldDefinition, 
  BaseField, 
  SelectField, 
  ArrayField,
  FieldType,
  StyleFieldCategory
} from "./field.types";

export type { 
  ResponsiveStyle, 
  StyleObject,
  StyleValue
} from "./style.types";

// ========================
// Devices
// ========================
export type Device = "desktop" | "tablet" | "mobile";

// ========================
// Validation Rules
// ========================
export type ValidationRules = {
  required?: boolean;
  cssUnit?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
};

// ========================
// Block Types
// ========================
export type BlockType =
  | "root"
  | "section"
  | "text"
  | "image"
  | "button"
  | "navbar"
  | "footer"
  | "title"
  | "cta"
  | "hero"
  | "flex"
  | "flexItem"
  | "grid"
  | "link"
  | "features"
| "valuesGrid"
| "officeTable"
| "featurePillars"
| "gridItem"
| "input"
  | "select"
  | "textarea";

// ========================
// Block Rules
// ========================
export type BlockRules = {
  allowedParents?: BlockType[];
  allowedChildren?: BlockType[];
  singleton?: boolean;
  isRootOnly?: boolean;
};

// ========================
// Block Runtime Instance
// ========================
export interface Block {
  id: string;
  type: BlockType;
  data: {
    props: Record<string, unknown>;
    style: any; 
  };
  children: Block[];


meta?: BlockMeta & {

  isLocked?: boolean;

  isHidden?: boolean;

  label?: string;

  displayName?: string;
};
}

// ========================
// Page Runtime
// ========================
export interface PageData {
  id: number;
  siteId: number;
  title: string;
  blocks: Block[];
}

// ========================
// Renderer Props Contract
// ========================
export type RuntimeMode = "editor" | "preview" | "public";

export interface BlockRendererProps<P = Record<string, any>> { // 🟢 دعم الـ Generic Props للـ Renderer
  block?: Block;
  data: {
    props: P;
    style: StyleObject; 
  };
  device: Device;
  context?: {
    mode?: RuntimeMode;
  };
}

// ========================
// 🏆 The Master Block Config (Hardened with Generics)
// ========================
import type { FieldDefinition } from "./field.types";
import type { ResponsiveStyle, StyleObject } from "./style.types";
import { BlockMeta } from "./blockMeta.types";

// 🟢 الـ Generic <P> هوني يخلّي كل Block يحدد الـ Type متع الـ Props الخاصة بيه حصراً
export interface BlockConfig<P extends Record<string, unknown> = Record<string, unknown>> {
  type: BlockType;
  label: string;
  icon?: React.ReactNode;
  category: "layout" | "content" | "semantic" | "primitive";
  
  isContainer: boolean; 
  
  rules?: BlockRules;
  allowedChildren?: BlockType[];

  // Inspector schema
  fields: FieldDefinition[]; 

  // Runtime renderer component
  component: React.ComponentType<BlockRendererProps<P>>;

  // Initial state (Hardened & Strictly Checked!)
  defaultData: {
    props: P; // 🟢 توة الـ props ولّت ملوية وما يقبلش الـ unknown العشوائي
    style: ResponsiveStyle;
  };
}

// ========================
// Validation Errors
// ========================
export type ErrorType = "singleton_violation" | "nesting_error" | "root_violation";

export interface ValidationError {
  blockId: string;
  type: ErrorType;
  message: string;
}

export type BlockField = FieldDefinition;
