// src/modules/pageBuilder/runtime/importers/html/mapElementToBlock.ts

import type {
  SerializedBlock
} from "../../../types/document/serialized.types";

export const mapElementToBlock = (
  element: Element
): SerializedBlock | null => {

  const tag =
    element.tagName.toLowerCase();

  // =========================
  // TITLE
  // =========================

  if (
    tag === "h1" ||
    tag === "h2" ||
    tag === "h3"
  ) {

    return {

      id:
        crypto.randomUUID(),

      type:
        "title",

      props: {

        content:
          element.textContent || ""
      },

      style: {},

      children: []
    };
  }

  // =========================
  // TEXT
  // =========================

  if (tag === "p") {

    return {

      id:
        crypto.randomUUID(),

      type:
        "text",

      props: {

        content:
          element.textContent || ""
      },

      style: {},

      children: []
    };
  }

  // =========================
  // SECTION
  // =========================

  if (tag === "section") {

    return {

      id:
        crypto.randomUUID(),

      type:
        "section",

      props: {},

      style: {},

      children: []
    };
  }

  return null;
};