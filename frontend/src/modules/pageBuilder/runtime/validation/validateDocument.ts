import type {
  PageDocument
} from "../../types/document/serialized.types";

import {
  validateBlock,
  type DocumentValidationError
} from "./validateBlock";

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

export class DocumentValidationException extends Error {
  errors: DocumentValidationError[];

  constructor(errors: DocumentValidationError[]) {
    super(
      errors.map((error) => `${error.path}: ${error.message}`).join("\n")
    );
    this.name = "DocumentValidationException";
    this.errors = errors;
  }
}

export const validateDocument = (
  value: unknown
): PageDocument => {
  const errors: DocumentValidationError[] = [];

  if (!isRecord(value)) {
    throw new DocumentValidationException([
      {
        path: "$",
        message: "Document must be an object"
      }
    ]);
  }

  if (value.schemaVersion !== 1) {
    errors.push({
      path: "schemaVersion",
      message: "schemaVersion must be 1"
    });
  }

  if (value.schemaId !== "page-builder-document") {
    errors.push({
      path: "schemaId",
      message: "schemaId must be page-builder-document"
    });
  }

  if (typeof value.createdWith !== "string" || !value.createdWith.trim()) {
    errors.push({
      path: "createdWith",
      message: "createdWith must be a non-empty string"
    });
  }

  if (!Array.isArray(value.blocks)) {
    errors.push({
      path: "blocks",
      message: "blocks must be an array"
    });
  } else {
    const visitedObjects = new WeakSet<object>();
    const visitedIds = new Set<string>();

    value.blocks.forEach((block, index) => {
      errors.push(
        ...validateBlock(
          block,
          `blocks[${index}]`,
          visitedObjects,
          visitedIds
        )
      );
    });
  }

  if (errors.length) {
    throw new DocumentValidationException(errors);
  }

  return value as unknown as PageDocument;
};
