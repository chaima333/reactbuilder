// frontend/src/modules/pageBuilder/runtime/operations/applyOperation.ts

import { PageData, Block } from "../../types/page.types";
import { Operation } from "./types";

// الحارس الأمين: يمنع الحلقات المفرغة (Cycle Protection) ويتحقق من وجود العناصر
const validateInvariants = (blocks: Block[], operation: Operation): void => {
  if (operation.type !== "move_block") return;

  const { blockId, targetParentId } = operation;

  // بناء خريطة لمعرفة الـ Ancestors بـ O(n)
  const parentMap = new Map<string, string>();
  const buildParentIndex = (list: Block[], parentId = "root") => {
    for (const node of list) {
      parentMap.set(node.id, parentId);
      if (node.children?.length) buildParentIndex(node.children, node.id);
    }
  };
  buildParentIndex(blocks);

  // تتبع مسار الـ Target Parent صعوداً إلى الـ Root
  let currentParentId = targetParentId;
  while (currentParentId && currentParentId !== "root") {
    if (currentParentId === blockId) {
      throw new Error(`Invariant Violation: Cannot move parent [${blockId}] into its own descendant [${targetParentId}]. Operation aborted.`);
    }
    currentParentId = parentMap.get(currentParentId) || "root";
  }
};

export const applyOperation = (page: PageData, operation: Operation): PageData => {
  // 🚨 فحص الـ Invariants والـ Cycles قبل لمس الـ State
  validateInvariants(page.blocks, operation);

  switch (operation.type) {
    case "insert_block":
      return {
        ...page,
        blocks: insertBlockImmutable(page.blocks, operation.parentId, operation.index, operation.block as unknown as Block)
      };

    case "remove_block":
      return {
        ...page,
        blocks: removeBlockImmutable(page.blocks, operation.blockId)
      };

    case "move_block": {
      // الـ Move هو عبارة عن قطبين مستقرين (Pure Extract) متبوع بـ (Pure Insert) بدون أي Mutations
      const { extractedNode, cleanTree } = extractBlockImmutable(page.blocks, operation.blockId);
      if (!extractedNode) return page; // لم يعثر على الـ Block المراد نقله
      
      return {
        ...page,
        blocks: insertBlockImmutable(cleanTree, operation.targetParentId, operation.targetIndex, extractedNode)
      };
    }

    case "update_props":
      return {
        ...page,
        blocks: updatePropsImmutable(page.blocks, operation.blockId, operation.propsPatch)
      };

    case "update_style":
      return {
        ...page,
        blocks: updateStyleImmutable(page.blocks, operation.blockId, operation.device, operation.stylePatch)
      };

    default:
      return page;
  }
};

// --- 🔥 Pure Structural Sharing Transformers ---

const insertBlockImmutable = (blocks: Block[], parentId: string, index: number, newBlock: Block): Block[] => {
  if (parentId === "root") {
    return [...blocks.slice(0, index), newBlock, ...blocks.slice(index)];
  }

  return blocks.map((block) => {
    if (block.id === parentId) {
      const currentChildren = block.children || [];
      return {
        ...block,
        children: [...currentChildren.slice(0, index), newBlock, ...currentChildren.slice(index)]
      };
    }
    if (block.children?.length) {
      return {
        ...block,
        children: insertBlockImmutable(block.children, parentId, index, newBlock)
      };
    }
    return block;
  });
};

const removeBlockImmutable = (blocks: Block[], blockId: string): Block[] => {
  return blocks
    .filter((block) => block.id !== blockId)
    .map((block) => {
      if (block.children?.length) {
        return { ...block, children: removeBlockImmutable(block.children, blockId) };
      }
      return block;
    });
};

const extractBlockImmutable = (blocks: Block[], blockId: string): { extractedNode: Block | null; cleanTree: Block[] } => {
  let extractedNode: Block | null = null;

  const recurse = (list: Block[]): Block[] => {
    const target = list.find((b) => b.id === blockId);
    if (target) {
      extractedNode = target;
      return list.filter((b) => b.id !== blockId);
    }
    return list.map((b) => {
      if (b.children?.length) {
        return { ...b, children: recurse(b.children) };
      }
      return b;
    });
  };

  const cleanTree = recurse(blocks);
  return { extractedNode, cleanTree };
};

const updatePropsImmutable = (blocks: Block[], blockId: string, patch: Record<string, unknown>): Block[] => {
  return blocks.map((block) => {
    if (block.id === blockId) {
      return {
        ...block,
        data: {
          ...block.data,
          props: { ...block.data?.props, ...patch }
        }
      };
    }
    if (block.children?.length) {
      return { ...block, children: updatePropsImmutable(block.children, blockId, patch) };
    }
    return block;
  });
};

const updateStyleImmutable = (
  blocks: Block[], 
  blockId: string, 
  device: "desktop" | "tablet" | "mobile", 
  patch: Record<string, unknown>
): Block[] => {
  return blocks.map((block) => {
    if (block.id === blockId) {
      const currentStyleSet = block.data?.style || {};
      const currentDeviceStyle = currentStyleSet[device] || {};

      return {
        ...block,
        data: {
          ...block.data,
          style: {
            ...currentStyleSet,
            [device]: {
              ...currentDeviceStyle,
              ...patch // ✅ دمج عميق على مستوى الـ Device المستهدف فقط دون التأثير على البقية
            }
          }
        }
      };
    }
    if (block.children?.length) {
      return { ...block, children: updateStyleImmutable(block.children, blockId, device, patch) };
    }
    return block;
  });
};