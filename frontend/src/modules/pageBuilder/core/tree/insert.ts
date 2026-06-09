import { Block } from "../../types/page.types";
import { canDrop } from "../../adapters/pageAdapter"; // جيب الـ validator اللي عملناه

/**
 * 🔥 Clean tree insert (With Validation & Safety)
 */
export const insertBlock = (
  blocks: Block[],
  drop: any,
  newBlock: Block
): Block[] => {
  if (
  drop.targetId === "ROOT"
) {

  if (
    drop.type === "inside"
  ) {

    return [
      ...blocks,
      newBlock
    ];
  }

  if (
    drop.type === "before"
  ) {

    return [
      newBlock,
      ...blocks
    ];
  }

  if (
    drop.type === "after"
  ) {

    return [
      ...blocks,
      newBlock
    ];
  }
}
  const result: Block[] = [];

  for (const block of blocks) {
    // 🎯 Target found (البلوك اللي سيبنا فوقه الماوس)
    if (block.id === drop.targetId) {

      // 🛡️ [SAFETY CHECK] 
      // إذا كان الـ Drop "inside"، لازم نثبتوا هل الـ Target يقبل الـ NewBlock
      if (drop.type === "inside") {
        if (!canDrop(block.type, newBlock.type)) {
          console.warn(`🚫 Validation: ${newBlock.type} cannot be added inside ${block.type}`);
          result.push(block); // نرجّع البلوك كيما هو بدون الـ newBlock
          continue;
        }

        result.push({
          ...block,
          children: [...(block.children || []), newBlock]
        });
      }

      // إذا كان BEFORE أو AFTER، البلوك الجديد باش يولي "خو" (Sibling) للـ Target
      // الـ Validation هنا أصعب شوية (لازم تثبت في الـ Parent)، 
      // لكن حالياً نركزو إنهم يتحطو مريڤلين
      if (drop.type === "before") {
        result.push(newBlock, block);
      }

      if (drop.type === "after") {
        result.push(block, newBlock);
      }

      continue;
    }

    // 🔁 Recursion clean
    // نلوجو في وسط الـ children بعمق (Recursive search)
    result.push({
      ...block,
      children: block.children
        ? insertBlock(block.children, drop, newBlock)
        : []
    });
  }

  return result;
};