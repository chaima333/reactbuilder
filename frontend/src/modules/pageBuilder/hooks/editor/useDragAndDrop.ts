// src/modules/pageBuilder/hooks/editor/useDragAndDrop.ts
import { useState, useEffect } from "react";
import { DragEndEvent, pointerWithin } from "@dnd-kit/core";
import { Block } from "../../types/page.types";
import { blockRegistry } from "../../core/blockRegistry";
import { canDrop } from "../../adapters/pageAdapter";
import { findParentBlock } from "../../core/tree/findParentBlock";

// --- Helpers المستعملة داخل الـ Drag ---
const findBlockInTree = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children && block.children.length > 0) {
      const found = findBlockInTree(block.children, id);
      if (found) return found;
    }
  }
  return null;
};

const getDropPosition = (
  clientY: number,
  targetRect: DOMRect
): "before" | "after" | "inside" => {
  const relativeY = (clientY - targetRect.top) / targetRect.height;
  if (relativeY < 0.2) return "before";
  if (relativeY > 0.8) return "after";
  return "inside";
};

interface UseDragAndDropProps {
  blocks: Block[];
  actions: {
    addBlock: (type: string, targetId: string, position: "before" | "after" | "inside", presetData?: any) => void;
    moveBlock: (blockId: string, location: { resolvedTargetId: string; type: "before" | "after" | "inside" }) => void;
  };
}

export const useDragAndDrop = ({ blocks, actions }: UseDragAndDropProps) => {
  // 🚨 STEP 3 & 4: الـ States المخصوصة كاملة
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | "inside" | null>(null);
  const [isAllowed, setIsAllowed] = useState<boolean>(true);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  // Ghost Follow Effect تقعد هوني تابعة الـ Ghost State
  useEffect(() => {
    if (!activeId) return;
    const handleMove = (e: MouseEvent) => {
      setGhost({ x: e.clientX + 15, y: e.clientY + 15 });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [activeId]);

  // 🚨 STEP 5: الـ Handlers المخصوصة كاملة
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    setActiveData(event.active.data.current);
  };

  const handleDragOver = (event: any) => {
    const { over, active } = event;
    if (!over) {
      setOverId(null);
      setDropPosition(null);
      setIsAllowed(true);
      return;
    }

    const targetId = over.id.toString();
    const runtimeBlock = findBlockInTree(blocks, active.id.toString());
    const draggedType = active.data.current?.type || runtimeBlock?.type;

    setOverId(targetId);
    const overElement = document.getElementById(targetId);
    if (!overElement) return;

    const rect = overElement.getBoundingClientRect();
    const clientY = (event.activatorEvent as MouseEvent)?.clientY || 0;
    const position = getDropPosition(clientY, rect);

    const targetBlock = findBlockInTree(blocks, targetId);
    const isContainer = targetBlock ? blockRegistry[targetBlock.type]?.isContainer : false;

    if (targetBlock && isContainer) {
      setDropPosition("inside");
      setIsAllowed(draggedType ? canDrop(targetBlock.type, draggedType) : true);
    } else {
      setDropPosition(position);
      setIsAllowed(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !isAllowed) {
      setActiveId(null);
      setGhost(null);
      return;
    }

    const activeData = active.data.current; 
    const isNew = activeData?.isNew;
    const presetData = activeData?.presetData; 
    
    const runtimeBlock = findBlockInTree(blocks, active.id.toString());
    const type = activeData?.type || runtimeBlock?.type;
    const targetId = over.id.toString();
    const activeIdStr = active.id.toString();

    const targetBlock = findBlockInTree(blocks, targetId);
    let resolvedTargetId = targetId;

    if (targetBlock && !blockRegistry[targetBlock.type]?.isContainer) {
      const parent = findParentBlock(blocks, targetId);
      if (parent) {
        resolvedTargetId = parent.id;
      }
    }

    const isTargetContainer = targetBlock ? blockRegistry[targetBlock.type]?.isContainer : false;
    const effectivePosition = isTargetContainer ? "inside" : dropPosition || "after";

    if (isNew) {
      actions.addBlock(type, resolvedTargetId, effectivePosition, presetData);
    } else if (activeIdStr !== targetId) {
      actions.moveBlock(activeIdStr, { resolvedTargetId, type: effectivePosition });
    }

    setActiveId(null);
    setOverId(null);
    setGhost(null);
  };

  // 🚨 STEP 6: الـ Return النظيف
  return {
    activeId,
    activeData,
    overId,
    dropPosition,
    isAllowed,
    ghost,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};