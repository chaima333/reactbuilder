import type {
  StructuralNode
} from "../structure/buildStructuralGraph";

export type OfficeTableItem = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;

  titleStyle?: Record<string, any>;
  subtitleStyle?: Record<string, any>;
  descriptionStyle?: Record<string, any>;
  rowStyle?: Record<string, any>;
  nameStyle?: Record<string, any>;
};

export type OfficeTablePayload = {
  type: "OFFICES_TABLE";

  badge?: string;
  title?: string;
  description?: string;

  sectionStyle?: Record<string, any>;
  headerStyle?: Record<string, any>;
  badgeStyle?: Record<string, any>;
  titleStyle?: Record<string, any>;
  descriptionStyle?: Record<string, any>;
  tableStyle?: Record<string, any>;
  containerStyle?: Record<string, any>;

  items: OfficeTableItem[];

  claimedNode?: StructuralNode;
};
