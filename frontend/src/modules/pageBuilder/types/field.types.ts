
// ========================
// Field Types
// ========================

export type FieldType =
  | "text"
  | "textarea"
  | "color"
  | "select"
  | "array"
  | "number"
  | "boolean"
  | "image"
  | "cmsCollectionSelect"
  | "cmsFieldSelect"
  | "cmsBinding"
  | "formSelect";

// ========================
// Style Categories
// ========================

export type StyleFieldCategory =
  | "layout"
  | "spacing"
  | "typography"
  | "visual";

// ========================
// Validation
// ========================

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  cssUnit?: boolean; 
}

// ========================
// Base Field
// ========================
export interface BaseField {
  key: string;
  label: string;
  type: FieldType;
  target: "props" | "style";

  category?: StyleFieldCategory;
  responsive?: boolean;
  validation?: ValidationRules; 
  resetFields?: string[];
}

// ========================
// Select Field
// ========================

export interface SelectField
  extends BaseField {

  type: "select";

  options: {

    label: string;

    value: any;

  }[];
}

// ========================
// Array Field
// ========================

export interface ArrayField
  extends BaseField {

  type: "array";

  itemSchema: FieldDefinition[];

  maxItems?: number;
}

// ========================
// Final Union
// ========================

export type FieldDefinition =
  | BaseField
  | SelectField
  | ArrayField;