import type {
  Block
} from "../../types/page.types";

const EMPTY_STYLE_VALUES =
  new Set<unknown>([
    undefined,
    null,
    "",
    "normal",
    "none",
    "0",
    "0px",
    "0px 0px",
    "rgba(0, 0, 0, 0)",
    "rgba(0,0,0,0)",
    "transparent"
  ]);

const hasMeaningfulStyle = (
  style: any
) => {
  const desktop =
    style?.desktop || style || {};

  return Object.values(
    desktop
  ).some(
    value =>
      !EMPTY_STYLE_VALUES.has(
        value
      )
  );
};

const hasTextContent = (
  block: Block
) => {
  const content =
    block.data?.props?.content ??
    block.data?.props?.label;

  return (
    typeof content === "string" &&
    content.trim().length > 0
  );
};

const isEmptyPrimitive = (
  block: Block
) =>
  (
    block.type === "text" ||
    block.type === "title" ||
    block.type === "link" ||
    block.type === "button"
  ) &&
  !hasTextContent(
    block
  );

const shouldRemoveEmptyContainer = (
  block: Block
) => {
  const childCount =
    block.children?.length || 0;

  if (childCount > 0) {
    return false;
  }

  if (
    block.type === "flex" ||
    block.type === "grid"
  ) {
    return true;
  }

  if (
    block.type === "flexItem" ||
    block.type === "gridItem"
  ) {
    return !hasMeaningfulStyle(
      block.data?.style
    );
  }

  return false;
};

export const purgeEmptyBlocks = (
  blocks: Array<Block | null | undefined> = []
): Block[] => {

  return blocks
    .filter(
      (block): block is Block =>
        !!block
    )
    .map(block => ({

      ...block,

      children:

        purgeEmptyBlocks(
          block.children || []
        )
    }))
    .filter(block => {

      // =====================
      // REMOVE EMPTY TEXTS
      // =====================

      if (
        isEmptyPrimitive(
          block
        )
      ) {

        return false;
      }

      if (
        shouldRemoveEmptyContainer(
          block
        )
      ) {

        return false;
      }

      return true;
    });
};
