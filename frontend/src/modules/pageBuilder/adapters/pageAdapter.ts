import { Block } from "../types/page.types";
import { blockRegistry } from "../core/blockRegistry";

/**
 * =========================
 * 🔁 BACKEND → FRONTEND
 * =========================
 */
export const fromAPIToUI = (blocks: any[]): Block[] => {
  const allowedTypes = Object.keys(blockRegistry);

  const walk = (nodes: any[]): Block[] => {
    return (nodes || []).map((b) => {
      
      // 🛑 VALIDATION LAYER
      if (!b?.type) {
        throw new Error("Block missing type");
      }

      if (!allowedTypes.includes(b.type)) {
        throw new Error(`Unknown block type: ${b.type}`);
      }

      return {
        id: b.id,
        type: b.type,

        data: {
          props: b.props ?? {},
          style: b.style ?? {},
        },

        children: b.children ? walk(b.children) : [],
      };
    });
  };

  return walk(blocks);
};

/**
 * =========================
 * 🔁 FRONTEND → BACKEND
 * =========================
 */
export const fromUIToAPI = (blocks: Block[]): any[] => {
  const walk = (nodes: Block[]): any[] => {
    return nodes.map((b) => {
      
      // 🛑 SAFETY CHECK
      if (!blockRegistry[b.type]) {
        throw new Error(`Block not registered: ${b.type}`);
      }

      return {
        id: b.id,
        type: b.type,

        props: b.data?.props ?? {},
        style: b.data?.style ?? {},

        children: b.children?.length ? walk(b.children) : [],
      };
    });
  };

  return walk(blocks);
};

// src/core/validator.ts

// في ملف validator.ts أو blockRegistry.ts
import { BlockType } from "../types/page.types";

export const canDrop = (parentType: string, childType: string): boolean => {
  // نحول الـ string إلى BlockType عند التعامل مع الـ Registry
  const parentConfig = blockRegistry[parentType as BlockType];

  if (!parentConfig || !parentConfig.isContainer) return false;

  const allowed = parentConfig.allowedChildren || [];
  
  // نتحقق إذا كان الـ childType (string) موجود في مصفوفة الـ BlockType[]
  return allowed.includes(childType as BlockType);
};