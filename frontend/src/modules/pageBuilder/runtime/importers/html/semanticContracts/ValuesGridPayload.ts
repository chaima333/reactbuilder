import {
  BaseSemanticPayload
} from "./BaseSemanticPayload";

export type ValuesGridItem = {

  id: string;

  title: string;

  description: string;
};

export interface ValuesGridPayload
  extends BaseSemanticPayload {

 type: "VALUES_GRID";

  items: ValuesGridItem[];

  eyebrow?: string;

  title?: string;
  description?: string;

  columnCount?: number;

  sectionStyle?: any;

descriptionStyle?: any;

  containerStyle?: any;
  eyebrowStyle?: any;
titleStyle?: any;

  sourceElement?: HTMLElement;

  gridStyle?: any;
}
