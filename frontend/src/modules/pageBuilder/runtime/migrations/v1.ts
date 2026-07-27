import type {
  PageDocument,
  SerializedBlock
} from "../../types/document/serialized.types";

const isRecord = (
  value: unknown
): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

const toSerializedBlock = (
  value: unknown
): SerializedBlock => {
  if (!isRecord(value)) {
    throw new Error("Invalid block: expected object");
  }

  const data = isRecord(value.data) ? value.data : {};

  return {
    id: String(value.id || crypto.randomUUID()),
    type: String(value.type || ""),
    data: {
      props: {
        ...(
        isRecord(value.props)
          ? value.props
          : isRecord(data.props)
          ? data.props
          : {}
        )
      },
      style:
        value.style !== undefined
          ? value.style
          : data.style
    },
    children: Array.isArray(value.children)
      ? value.children.map(toSerializedBlock)
      : []
  };
};

export const migrateToV1 = (
  input: unknown
): PageDocument => {
  if (!isRecord(input)) {
    throw new Error("Invalid document: expected object");
  }

  const blocks = Array.isArray(input.blocks)
    ? input.blocks.map(toSerializedBlock)
    : [];

  return {
    schemaVersion: 1,
    schemaId: "page-builder-document",
    createdWith:
      typeof input.createdWith === "string"
        ? input.createdWith
        : "migration-v1",
    metadata: isRecord(input.metadata)
      ? {
        createdAt: typeof input.metadata.createdAt === "string"
          ? input.metadata.createdAt
          : undefined,
        updatedAt: typeof input.metadata.updatedAt === "string"
          ? input.metadata.updatedAt
          : undefined
      }
      : undefined,
    blocks
  };
};
