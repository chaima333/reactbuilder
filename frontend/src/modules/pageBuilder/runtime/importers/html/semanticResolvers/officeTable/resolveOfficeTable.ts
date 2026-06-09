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

export const resolveOfficeTable = (
  node: StructuralNode
): OfficeTablePayload | null => {

  // =====================================
  // DETECT
  // =====================================

  const detected =

    detectOfficeTable(
      node
    );

  if (
    !detected
  ) {

    return null;
  }

  // =====================================
  // EXTRACT
  // =====================================

  const items =

    extractOfficeTable(
      node
    );

  // =====================================
  // VALIDATE
  // =====================================

  const valid =

    validateOfficeTable(
      items
    );

  if (
    !valid
  ) {

    return null;
  }

  console.log(
    "🏢 OFFICE TABLE DETECTED",
    items
  );

return {

  type:
    "OFFICES_TABLE",

  items,

  claimedNode:
    node
};
};