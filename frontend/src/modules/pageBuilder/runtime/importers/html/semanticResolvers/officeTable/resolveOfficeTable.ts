import { OfficeTablePayload } from "../../semanticContracts/OfficeTablePayload";

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  detectOfficeTable
} from "./detectOfficeTable";

import {
  extractOfficeTable
} from "./extractOfficeTable";

import {
  validateOfficeTable
} from "./validateOfficeTable";

const findSectionOwner = (
  node: StructuralNode
): StructuralNode => {
  let current: StructuralNode | undefined = node;

  while (current) {
    const tag =
      current.element.tagName.toLowerCase();

    if (tag === "section") {
      return current;
    }

    if (tag === "body" || tag === "html") {
      break;
    }

    current = current.parent;
  }

  return node;
};

export const resolveOfficeTable = (
  node: StructuralNode
): OfficeTablePayload | null => {
  if (!detectOfficeTable(node)) {
    return null;
  }

  const extracted =
    extractOfficeTable(node);
    console.log("OFFICE ROOT", {
  tag: node.element.tagName,
  className: node.element.className,
  badge: extracted.badge,
  title: extracted.title,
  description: extracted.description
});

  const valid =
    validateOfficeTable(
      extracted.items
    );

  if (!valid) {
    return null;
  }

const claimedNode =
  findSectionOwner(node);

return {
  type: "OFFICES_TABLE",

  badge: extracted.badge,
  title: extracted.title,
  description: extracted.description,

  sectionStyle: extracted.sectionStyle,
  containerStyle: extracted.containerStyle,
  headerStyle: extracted.headerStyle,
  badgeStyle: extracted.badgeStyle,
  titleStyle: extracted.titleStyle,
  descriptionStyle: extracted.descriptionStyle,
  tableStyle: extracted.tableStyle,

  items: extracted.items,

  claimedNode
};
};
