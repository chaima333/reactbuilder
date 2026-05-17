import { blockRegistry } from "../../core/blockRegistry";
import type { FieldDefinition } from "../../types/field.types";
import type {
  SerializedBlock
} from "../../types/document/serialized.types";

export type DocumentValidationError = {
  path: string;
  message: string;
};

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const readPath = (
  source: Record<string, unknown>,
  path: string
): unknown => {
  return path.split(".").reduce<unknown>(
    (current, segment) => {
      if (!isRecord(current)) return undefined;
      return current[segment];
    },
    source
  );
};

const isMissing = (
  value: unknown
): boolean => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
};

const validateRequiredProps = (
  block: SerializedBlock,
  fields: FieldDefinition[],
  path: string,
  errors: DocumentValidationError[]
) => {
  fields.forEach((field) => {
    if (
      field.target === "props" &&
      field.validation?.required &&
      isMissing(readPath(block.props, field.key))
    ) {
      errors.push({
        path: `${path}.props.${field.key}`,
        message: `Required prop missing: ${field.key}`
      });
    }
  });
};

export const validateBlock = (
  value: unknown,
  path = "blocks[0]",
  visitedObjects = new WeakSet<object>(),
  visitedIds = new Set<string>()
): DocumentValidationError[] => {
  const errors: DocumentValidationError[] = [];

  if (!isRecord(value)) {
    return [
      {
        path,
        message: "Block must be an object"
      }
    ];
  }

  if (visitedObjects.has(value)) {
    return [
      {
        path,
        message: "Cyclic block reference detected"
      }
    ];
  }

  visitedObjects.add(value);

  const id = value.id;
  const type = value.type;
  const props = value.props;
  const children = value.children;

  if (typeof id !== "string" || !id.trim()) {
    errors.push({
      path: `${path}.id`,
      message: "Block id must be a non-empty string"
    });
  } else if (visitedIds.has(id)) {
    errors.push({
      path: `${path}.id`,
      message: `Duplicate block id: ${id}`
    });
  } else {
    visitedIds.add(id);
  }

  if (typeof type !== "string" || !type.trim()) {
    errors.push({
      path: `${path}.type`,
      message: "Block type must be a non-empty string"
    });
  } else if (!blockRegistry[type]) {
    errors.push({
      path: `${path}.type`,
      message: `Unknown block type: ${type}`
    });
  }

  if (!isRecord(props)) {
    errors.push({
      path: `${path}.props`,
      message: "Block props must be an object"
    });
  }

  if (!Array.isArray(children)) {
    errors.push({
      path: `${path}.children`,
      message: "Block children must be an array"
    });
  }

  if (
    typeof type === "string" &&
    blockRegistry[type] &&
    isRecord(props)
  ) {
    validateRequiredProps(
      value as unknown as SerializedBlock,
      blockRegistry[type].fields,
      path,
      errors
    );
  }

  if (Array.isArray(children)) {
    children.forEach((child, index) => {
      errors.push(
        ...validateBlock(
          child,
          `${path}.children[${index}]`,
          visitedObjects,
          visitedIds
        )
      );
    });
  }

  return errors;
};
