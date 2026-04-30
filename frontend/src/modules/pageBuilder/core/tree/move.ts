import { Block, Column } from "../../types/page.types";

/**
 * الموتور الرئيسي لتحريك البلوكات
 */
export const moveBlockInTree = (blocks: Block[], activeId: string, drop: any): Block[] => {
  // 1. فك البلوك من بلاصته القديمة
  const { newTree, extracted } = extractBlock(blocks, activeId);
  
  // 2. إذا ما لقاش البلوك (حالة نادرة)، يرجع الـ tree كيف ما هي
  if (!extracted) return blocks;
  
  // 3. يزرع البلوك في البلاصة الجديدة (Target)
  return insertBlock(newTree, drop, extracted);
};

/**
 * سحب البلوك من الشجرة (Recursive)
 */
const extractBlock = (blocks: Block[], id: string): { newTree: Block[]; extracted: Block | null } => {
  let extracted: Block | null = null;

  const newTree = blocks
    .filter((b) => {
      if (b.id === id) {
        extracted = b;
        return false; // فسخ من المستوى الحالي
      }
      return true;
    })
    .map((block) => {
      if (block.children) {
        const updatedCols = block.children.map((col: Column) => {
          const res = extractBlock(col.blocks || [], id);
          if (res.extracted) extracted = res.extracted;
          return { ...col, blocks: res.newTree };
        });
        return { ...block, children: updatedCols };
      }
      return block;
    });

  return { newTree, extracted };
};

/**
 * زراعة البلوك في الهدف (Recursive)
 */
const insertBlock = (blocks: Block[], drop: any, blockToInsert: Block): Block[] => {
  const result: Block[] = [];

  for (const block of blocks) {
    // الحالة 1: وصلنا للبلوك الهدف
    if (block.id === drop.targetId) {
      if (drop.type === "before") {
        result.push(blockToInsert, block);
      } else if (drop.type === "after") {
        result.push(block, blockToInsert);
      } else if (drop.type === "inside") {
        const cols = [...(block.children || [])];
        const idx = drop.columnIndex || 0;

        if (cols[idx]) {
          cols[idx] = {
            ...cols[idx],
            blocks: [...(cols[idx].blocks || []), blockToInsert]
          };
        }
        result.push({ ...block, children: cols });
      }
    } 
    // الحالة 2: البحث داخل الأعمدة (Recursion)
    else {
      if (block.children && block.children.length > 0) {
        const updatedCols = block.children.map((col: Column) => ({
          ...col,
          blocks: insertBlock(col.blocks || [], drop, blockToInsert)
        }));
        result.push({ ...block, children: updatedCols });
      } else {
        result.push(block);
      }
    }
  }

  return result;
};