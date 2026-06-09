import { extractLayoutStyles } from "../../../css/extractStyleProps";
import { ValuesGridPayload } from "../../semanticContracts/ValuesGridPayload";
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

  // =====================================
  // DETECTION
  // =====================================

  const detected = detectValuesGrid( node ); if ( !detected) { return null;}

  // =====================================
  // EXTRACTION
  // =====================================

  const items = extractValuesGrid( node);

  // =====================================
  // VALIDATION
  // =====================================

  const valid =

    validateValuesGrid(
      items
    );

  if (
    !valid
  ) {

    return null;
  }

  console.log(
    "💎 VALUES GRID DETECTED",
    items
  );

  const computed =

  getOwnerComputedStyle(
    node.element
  );

const columnCount =

  computed
    .gridTemplateColumns
    .split(" ")
    .length;

  // =====================================
  // RESULT
  // =====================================
return {

  type:
    "VALUES_GRID",

  items,

  columnCount,

  sectionStyle:
    extractLayoutStyles(
      node.element
    ),

  gridStyle:
    extractLayoutStyles(
      node.element
    ),

  claimedNode:
    node
};
};
