import { blockRegistry } from "../core/blockRegistry";
import { Block, BlockType } from "../types/page.types";

export interface ValidationError {
  blockId: string;
  message: string;
  type: "singleton_violation" | "nesting_error" | "root_violation";
}

export const validateTree = (blocks: Block[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const typeCounts: Record<string, number> = {};

  // Helper function for recursive traversal
  const traverse = (nodes: Block[], parentType: BlockType | "root") => {
    for (const block of nodes) {
      const config = blockRegistry[block.type as Exclude<BlockType, "root">];
      
      // 1. Count types for Singleton Check
      typeCounts[block.type] = (typeCounts[block.type] || 0) + 1;

      // 2. Validate Nesting (Upward check)
      if (config?.rules?.allowedParents) {
        if (!config.rules.allowedParents.includes(parentType as any)) {
          errors.push({
            blockId: block.id,
            type: "nesting_error",
            message: `${block.type} cannot be placed inside ${parentType}`,
          });
        }
      }

      // 3. Singleton Violation Check
      if (config?.rules?.singleton && typeCounts[block.type] > 1) {
        errors.push({
          blockId: block.id,
          type: "singleton_violation",
          message: `Only one ${block.type} is allowed per page.`,
        });
      }

      // Recursive call for children
      if (block.children && block.children.length > 0) {
        traverse(block.children, block.type as BlockType);
      }
    }
  };

  traverse(blocks, "root");
  return errors;
};