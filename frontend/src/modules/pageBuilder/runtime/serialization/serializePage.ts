import type {
  Block
} from "../../types/page.types";

import type {
  PageDocument
} from "../../types/document/serialized.types";

import {
  serializeBlock
} from "./serializeBlock";

export const serializePage = (
  blocks: Block[]
): PageDocument => {

  return {

    schemaVersion: 1,

    schemaId:
      "page-builder-document",

    createdWith:
      "runtime-v1",

    blocks:
      blocks.map(
        serializeBlock
      )
  };
};
