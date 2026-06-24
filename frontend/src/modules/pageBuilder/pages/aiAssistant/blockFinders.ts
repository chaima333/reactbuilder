// aiAssistant/blockFinders.ts

/**
 * Type definitions for block structure
 * (Simplified version to avoid circular imports)
 */
export interface PageBlock {
  id: string;
  type: string;
  data?: {
    props?: Record<string, any>;
    style?: {
      desktop?: Record<string, any>;
      tablet?: Record<string, any>;
      mobile?: Record<string, any>;
    };
    meta?: {
      semanticType?: string;
    };
  };
  meta?: {
    semanticType?: string;
  };
  children?: PageBlock[];
  [key: string]: any;
}

/**
 * Find a block by predicate recursively
 */
export const findBlock = (
  blocks: PageBlock[] | undefined,
  predicate: (block: PageBlock) => boolean
): PageBlock | undefined => {
  if (!blocks || !Array.isArray(blocks)) {
    return undefined;
  }

  for (const block of blocks) {
    if (predicate(block)) {
      return block;
    }
    if (block.children && block.children.length > 0) {
      const found = findBlock(block.children, predicate);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * Find all blocks by predicate recursively
 */
export const findAllBlocks = (
  blocks: PageBlock[] | undefined,
  predicate: (block: PageBlock) => boolean
): PageBlock[] => {
  const result: PageBlock[] = [];

  if (!blocks || !Array.isArray(blocks)) {
    return result;
  }

  for (const block of blocks) {
    if (predicate(block)) {
      result.push(block);
    }
    if (block.children && block.children.length > 0) {
      result.push(...findAllBlocks(block.children, predicate));
    }
  }
  return result;
};

/**
 * Find all blocks by type recursively
 */
export const findAllBlocksByType = (
  blocks: PageBlock[] | undefined,
  type: string
): PageBlock[] => {
  return findAllBlocks(blocks, (block) => block.type === type);
};

/**
 * Find first block by type
 */
export const findBlockByType = (
  blocks: PageBlock[] | undefined,
  type: string
): PageBlock | undefined => {
  return findBlock(blocks, (block) => block.type === type);
};

/**
 * Find hero block
 * - Looks for block with hero in id/type/semanticType
 * - Or block with minHeight 60vh/70vh (hero style)
 */
export const findHeroBlock = (
  blocks: PageBlock[] | undefined
): PageBlock | undefined => {
  if (!blocks || !Array.isArray(blocks)) {
    return undefined;
  }

  return findBlock(
    blocks,
    (block) => {
      const id = (block.id || "").toLowerCase();
      const type = (block.type || "").toLowerCase();

      const semanticType = (
        block.data?.meta?.semanticType ||
        block.meta?.semanticType ||
        ""
      ).toLowerCase();

      return (
        id.includes("hero") ||
        type === "hero" ||
        type === "hero-section" ||
        semanticType === "hero" ||
        semanticType === "hero_section"
      );
    }
  );
};

/**
 * Find title block inside hero
 */
export const findTitleBlock = (heroBlock: PageBlock | undefined): PageBlock | undefined => {
  if (!heroBlock) return undefined;
  return findBlockByType(heroBlock.children, "title");
};

/**
 * Find text block inside hero
 */
export const findTextBlock = (heroBlock: PageBlock | undefined): PageBlock | undefined => {
  if (!heroBlock) return undefined;
  return findBlockByType(heroBlock.children, "text");
};

/**
 * Find button block inside hero
 */
export const findButtonBlock = (heroBlock: PageBlock | undefined): PageBlock | undefined => {
  if (!heroBlock) return undefined;
  return findBlockByType(heroBlock.children, "button");
};

/**
 * Find block by id recursively
 */
export const findBlockById = (
  blocks: PageBlock[] | undefined,
  id: string
): PageBlock | undefined => {
  return findBlock(blocks, (block) => block.id === id);
};

/**
 * Get all block IDs (flat list)
 */
export const getAllBlockIds = (blocks: PageBlock[] | undefined): string[] => {
  const ids: string[] = [];

  if (!blocks || !Array.isArray(blocks)) {
    return ids;
  }

  for (const block of blocks) {
    ids.push(block.id);
    if (block.children && block.children.length > 0) {
      ids.push(...getAllBlockIds(block.children));
    }
  }
  return ids;
};

/**
 * Count blocks by type
 */
export const countBlocksByType = (
  blocks: PageBlock[] | undefined,
  type: string
): number => {
  return findAllBlocksByType(blocks, type).length;
};

/**
 * Check if block has children
 */
export const hasChildren = (block: PageBlock | undefined): boolean => {
  return !!(block?.children && block.children.length > 0);
};

/**
 * Get all blocks (flattened)
 */
export const flattenBlocks = (blocks: PageBlock[] | undefined): PageBlock[] => {
  const result: PageBlock[] = [];

  if (!blocks || !Array.isArray(blocks)) {
    return result;
  }

  for (const block of blocks) {
    result.push(block);
    if (block.children && block.children.length > 0) {
      result.push(...flattenBlocks(block.children));
    }
  }
  return result;
};