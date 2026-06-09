



import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export type OfficeTableItem = {

  id: string;

  title: string;

  description: string;
};

export interface OfficeTablePayload
  extends BaseSemanticPayload {

  type:
    "OFFICES_TABLE";

  items:
    OfficeTableItem[];
}