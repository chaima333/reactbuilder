import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export type RepeatedSemanticEntityType =
  | "LABEL_VALUE_GROUP"
  | "CONTACT_TABLE"
  | "FORM_FIELD"
  | "OFFICE_LIST"
  | "CTA_GROUP";

export type LabelValuePair = {
  id: string;
  label: string;
  value: string;
};

export type FormFieldEntity = {
  id: string;
  label: string;
  placeholder: string;
  inputType: string;
  tag: string;
};

export type CtaEntity = {
  id: string;
  label: string;
  href: string;
  tag: string;
};

export interface RepeatedSemanticEntityPayload
  extends BaseSemanticPayload {
  type: RepeatedSemanticEntityType;
  confidence: number;
  reason: string[];
  pairs?: LabelValuePair[];
  fields?: FormFieldEntity[];
  actions?: CtaEntity[];
  items?: LabelValuePair[];
}
