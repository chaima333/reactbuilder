import type {
  Block
} from "../../types/page.types";

import type {
  PageDocument
} from "../../types/document/serialized.types";

import {
  runMigrations
} from "../migrations";

import {
  validateDocument
} from "../validation/validateDocument";

import {
  hydrateTree
} from "../normalize/NormalizeTree";

export type DeserializePageResult = {
  document: PageDocument;
  blocks: Block[];
};

export const deserializePage = (
  input: string | unknown
): DeserializePageResult => {
  const parsed =
    typeof input === "string"
      ? JSON.parse(input)
      : input;

  const migrated =
    runMigrations(parsed);

  const document =
    validateDocument(migrated);

  const blocks =
    hydrateTree(document.blocks);

  return {
    document,
    blocks
  };
};
