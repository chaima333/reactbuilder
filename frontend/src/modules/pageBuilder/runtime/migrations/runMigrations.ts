import type {
  PageDocument
} from "../../types/document/serialized.types";

import {
  migrateToV1
} from "./v1";

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

export const runMigrations = (
  input: unknown
): PageDocument => {
  if (!isRecord(input)) {
    throw new Error("Cannot migrate non-object document");
  }

  if (
    input.schemaVersion === 1 &&
    input.schemaId === "page-builder-document"
  ) {
    return migrateToV1(input);
  }

  if (Array.isArray(input.blocks)) {
    return migrateToV1(input);
  }

  throw new Error("Unsupported page document format");
};
