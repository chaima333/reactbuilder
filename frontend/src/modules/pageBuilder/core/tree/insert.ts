import { Block } from "../../types/page.types";
import { canDrop } from "../../adapters/pageAdapter"; // جيب الـ validator اللي عملناه

const isFooterBlock = (block: Block): boolean => {
  const semanticType =
    (block as any)?.meta?.semanticType ||
    (block as any)?.data?.meta?.semanticType;

  return (
    block.type === "footer" ||
    block.id?.startsWith("footer-section-") ||
    semanticType === "FOOTER" ||
    semanticType === "FOOTER_SECTION"
  );
};

const footerInsertIndex = (blocks: Block[]): number => {
  const index = blocks.findIndex(isFooterBlock);
  return index >= 0 ? index : blocks.length;
};

const treeHasFooter = (blocks: Block[]): boolean =>
  blocks.some(
    (block) =>
      isFooterBlock(block) ||
      treeHasFooter(block.children || [])
  );

/**
 * 🔥 Clean tree insert (With Validation & Safety)
 */
export const insertBlock = (
  blocks: Block[],
  drop: any,
  newBlock: Block
): Block[] => {
  if (isFooterBlock(newBlock) && treeHasFooter(blocks)) {
    return blocks;
  }

  if (
  drop.targetId === "ROOT"
) {
  const rootInsertIndex =
    isFooterBlock(newBlock)
      ? blocks.length
      : footerInsertIndex(blocks);

  if (
    drop.type === "inside"
  ) {

    const next = [...blocks];
    next.splice(rootInsertIndex, 0, newBlock);
    return next;
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

    const next = [...blocks];
    next.splice(rootInsertIndex, 0, newBlock);
    return next;
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
