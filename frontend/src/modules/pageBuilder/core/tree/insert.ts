import { v4 as uuidv4 } from "uuid";

type Block = any;

/**
 * ➕ Insert block inside a section column OR root
 */
export const addBlockToColumn = (
  blocks: Block[],
  sectionId: string,
  columnIndex: number,
  type: string,
  registry: any
): Block[] => {

  return blocks.map((block) => {

    // 🎯 CASE 1: FOUND SECTION
    if (block.id === sectionId) {

      const config = registry?.[type];
      if (!config) return block;

      const newBlock: Block = {
        id: uuidv4(),
        type,
        data: {
          props: { ...config.defaultData?.props },
          style: { ...config.defaultData?.style }
        }
      };

      const currentCols = block.children || [];

      const updatedCols = [...currentCols];

      updatedCols[columnIndex] = [
        ...(updatedCols[columnIndex] || []),
        newBlock
      ];

      return {
        ...block,
        children: updatedCols
      };
    }

    // 🔁 CASE 2: RECURSIVE SEARCH
    if (block.children?.length) {
      return {
        ...block,
        children: block.children.map((col: Block[]) =>
          addBlockToColumn(col, sectionId, columnIndex, type, registry)
        )
      };
    }

    return block;
  });
};