import {
  extractLayoutStyles
} from "../../../css/extractStyleProps";

import {
  ValuesGridPayload
} from "../../semanticContracts/ValuesGridPayload";

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getOwnerComputedStyle
} from "../../domGuards";

import {
  detectValuesGrid
} from "./detectValuesGrid";

import {
  extractValuesGrid
} from "./extractValuesGrid";

import {
  validateValuesGrid
} from "./validateValuesGrid";

export const resolveValuesGrid = (
  node: StructuralNode
): ValuesGridPayload | null => {

  const detected =
    detectValuesGrid(
      node
    );

  if (!detected) {
    return null;
  }

  const items =
    extractValuesGrid(
      node
    );

  const valid =
    validateValuesGrid(
      items
    );

  if (!valid) {
    return null;
  }

  const computed =
    getOwnerComputedStyle(
      node.element
    );

  const columnCount =
    computed.gridTemplateColumns
      .split(" ")
      .filter(Boolean)
      .length;

  const parent =
    node.element.parentElement as HTMLElement | null;

  const headerElement =
    parent?.querySelector(
      ".sec-head, [class*='sec-head']"
    ) as HTMLElement | null;

  const eyebrow =
    headerElement
      ?.querySelector(
        ".section-tag, [class*='tag']"
      )
      ?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const title =
    headerElement
      ?.querySelector("h2,h3")
      ?.textContent
      ?.replace(/\s+/g, " ")
      .trim() || "";

  const sectionStyle =
    extractLayoutStyles(
      node.element
    );

  const gridStyle =
    extractLayoutStyles(
      node.element
    );

  delete gridStyle.desktop.height;
  delete gridStyle.desktop.minHeight;
  delete gridStyle.desktop.maxHeight;
  delete gridStyle.desktop.gridTemplateRows;
  delete gridStyle.desktop.gridAutoRows;
  delete gridStyle.desktop.margin;
  delete gridStyle.desktop.marginTop;
  delete gridStyle.desktop.marginBottom;

  delete sectionStyle.desktop.display;
  delete sectionStyle.desktop.gridTemplateColumns;
  delete sectionStyle.desktop.gridTemplateRows;
  delete sectionStyle.desktop.gridAutoRows;
  delete sectionStyle.desktop.height;
  delete sectionStyle.desktop.minHeight;
  delete sectionStyle.desktop.maxHeight;

  console.log(
    "VALUES_GRID_HEADER",
    {
      eyebrow,
      title
    }
  );

  return {
    type:
      "VALUES_GRID",

    items,

    eyebrow,

    title,

    columnCount,

    sectionStyle,

    gridStyle,

    sourceElement:
      node.element,

    claimedNode:
      node
  };
};