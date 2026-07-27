import type {
  Block
} from "../../types/page.types";

import type {
  SerializedBlock
} from "../../types/document/serialized.types";

const sortPortableValue = (
  value: unknown
): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortPortableValue);
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>(
        (acc, key) => {
          acc[key] = sortPortableValue(
            (value as Record<string, unknown>)[key]
          );
          return acc;
        },
        {}
      );
  }

  return value;
};

export const serializeBlock = (
  block: Block
): SerializedBlock => {

  return {

    id: block.id,

    type: block.type,

    data: {
      props: {
        ...(sortPortableValue(block.data.props) as Record<string, unknown>)
      },
      style: sortPortableValue(block.data.style)
    },

    children:
      block.children.map(
        serializeBlock
      )
  };
};
