import { useEffect, useRef, useState } from "react";
import {
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  pointerWithin
} from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid";

import { resolveDropBehavior } from "../../core/dnd/DropResolver";
import {
  getSemanticDroppableId,
  isSemanticDroppableElement
} from "../../core/dnd/isSemanticDroppableElement";
import { blockRegistry } from "../../core/blockRegistry";
import { findBlockInTree } from "../../core/tree/utils";
import { Block, BlockType } from "../../types/page.types";
import { VIRTUAL_ROOT_ID } from "../../components/editor/EditorCanvas";

interface InsertionResult {
  position: "before" | "after" | "inside";
  index: number;
}

interface DropState {
  allowed: boolean;
  position: "before" | "after" | "inside";
  index: number;
  targetId: string;
  wrapperType?: "gridItem" | "flexItem";
}

interface UseDragAndDropProps {
  blocks: Block[];
  actions: {
    addBlock: (
      type: string,
      targetId?: string,
      position?: string,
      presetData?: any,
      insertIndex?: number
    ) => void;
    moveBlock: (
      blockId: string,
      location: {
        targetId?: string;
        type: "before" | "after" | "inside";
        index?: number;
        wrapperType?: string;
      }
    ) => void;
  };
}

const semanticPriority: BlockType[] = [
  "gridItem",
  "flexItem",
  "grid",
  "flex",
  "section"
];

export const customCollisionStrategy: CollisionDetection = (args) => {
  const collisions = pointerWithin(args);

  if (!collisions.length) {
    return [];
  }

  return collisions.sort((a, b) => {
    const containerA = args.droppableContainers.find(
      (container) => container.id === a.id
    );
    const containerB = args.droppableContainers.find(
      (container) => container.id === b.id
    );

    const priorityA = semanticPriority.indexOf(
      containerA?.data.current?.type
    );
    const priorityB = semanticPriority.indexOf(
      containerB?.data.current?.type
    );

    const safePriorityA =
      priorityA === -1 ? Number.MAX_SAFE_INTEGER : priorityA;
    const safePriorityB =
      priorityB === -1 ? Number.MAX_SAFE_INTEGER : priorityB;

    return safePriorityA - safePriorityB;
  });
};

const calculateInsertionIndex = (
  event: DragOverEvent,
  targetBlock: Block
): InsertionResult => {
  const { over, activatorEvent } = event;

  if (!over || !(activatorEvent instanceof MouseEvent)) {
    return { position: "inside", index: targetBlock.children?.length || 0 };
  }

  const children = targetBlock.children || [];

  if (!children.length) {
    return { position: "inside", index: 0 };
  }

  const overId = over.id.toString();
  const childIndex = children.findIndex((child) => child.id === overId);

  if (childIndex === -1) {
    return { position: "inside", index: children.length };
  }

  const targetElement = document.getElementById(`pb-runtime-${overId}`);

  if (!targetElement) {
    return { position: "inside", index: children.length };
  }

  const rect = targetElement.getBoundingClientRect();
  const relativeY = (activatorEvent.clientY - rect.top) / rect.height;

  if (relativeY < 0.5) {
    return { position: "before", index: childIndex };
  }

  return { position: "after", index: childIndex + 1 };
};

const getDraggedType = (
  active: DragOverEvent["active"] | DragEndEvent["active"],
  blocks: Block[]
): BlockType | null => {
  const runtimeBlock = findBlockInTree(blocks, active.id.toString());

  return (
    active.data.current?.type ||
    runtimeBlock?.type ||
    null
  ) as BlockType | null;
};

const isPrimitiveBlock = (type: BlockType) =>
  ["button", "image", "text", "title"].includes(type);

const getTopSemanticTarget = (
  elements: Element[],
  blocks: Block[]
): HTMLElement | null => {

  const semanticElements =
    elements.filter(
      isSemanticDroppableElement
    );

  let fallback:
    HTMLElement | null =
      null;

  for (const element of semanticElements) {

    const id =
      getSemanticDroppableId(
        element
      );

    // 👑 VIRTUAL ROOT
    if (
      id ===
      VIRTUAL_ROOT_ID
    ) {
      return element as HTMLElement;
    }

    const block =
      findBlockInTree(
        blocks,
        id
      );

    if (!block) {
      continue;
    }

    if (
      block.type === "gridItem" ||
      block.type === "flexItem"
    ) {
      return element as HTMLElement;
    }

    if (
      !fallback &&
      (
        block.type === "section" ||
        block.type === "flex" ||
        block.type === "grid"
      )
    ) {

      fallback =
        element as HTMLElement;
    }
  }

  return fallback;
};


export const useDragAndDrop = ({
  blocks,
  actions
}: UseDragAndDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<
    "before" | "after" | "inside" | null
  >(null);
  const [isAllowed, setIsAllowed] = useState(true);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  const currentResolutionRef = useRef<DropState | null>(null);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      setGhost({ x: event.clientX + 15, y: event.clientY + 15 });
    };

    window.addEventListener("mousemove", handleMove);

    return () => window.removeEventListener("mousemove", handleMove);
  }, [activeId]);

  const resetHoverState = () => {
    setOverId(null);
    setDropPosition(null);
    setIsAllowed(true);
    currentResolutionRef.current = null;
  };

  const resetDragState = () => {
    setActiveId(null);
    setActiveData(null);
    setGhost(null);
    resetHoverState();
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id.toString());
    setActiveData(event.active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, activatorEvent } = event;

    const draggedType = getDraggedType(active, blocks);

    if (!draggedType || !(activatorEvent instanceof MouseEvent)) {
      resetHoverState();
      return;
    }

    const elements = document.elementsFromPoint(
      activatorEvent.clientX,
      activatorEvent.clientY
    );

    const semanticElement = getTopSemanticTarget(elements, blocks);

    if (!semanticElement) {
      resetHoverState();
      return;
    }

    const targetId =
  getSemanticDroppableId(
    semanticElement
  );

// 👑 ROOT HANDLING
if (targetId === VIRTUAL_ROOT_ID) {

  setOverId("ROOT");

  setDropPosition("inside");

  setIsAllowed(true);

  currentResolutionRef.current = {

    allowed: true,

    position: "inside",

    index: blocks.length,

    targetId: VIRTUAL_ROOT_ID
  };

  return;
}

const targetBlock =
  findBlockInTree(
    blocks,
    targetId
  );

if (!targetBlock) {

  resetHoverState();

  return;
}

    const insertionInfo = calculateInsertionIndex(event, targetBlock);
    const resolution = resolveDropBehavior({
      draggedType,
      targetType: targetBlock.type,
      calculatedPosition: insertionInfo.position,
      calculatedIndex: insertionInfo.index,
      targetChildrenCount: targetBlock.children?.length || 0
    });

    setOverId(targetBlock.id);
    setDropPosition(resolution.position);
    setIsAllowed(resolution.allowed);

    currentResolutionRef.current = {
      ...resolution,
      targetId: targetBlock.id
    };
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    const resolution = currentResolutionRef.current;

    if (!resolution || !resolution.allowed) {
      resetDragState();
      return;
    }

    const draggedType = getDraggedType(active, blocks);

    if (!draggedType) {
      resetDragState();
      return;
    }

  const isRootDrop =
  resolution.targetId === VIRTUAL_ROOT_ID;

const targetBlock =
  isRootDrop
    ? null
    : findBlockInTree(
        blocks,
        resolution.targetId
      );

if (
  !isRootDrop &&
  !targetBlock
) {

  resetDragState();

  return;
}
const activePayload = active.data.current as
  | {
      type: BlockType;
      isNew: boolean;
    }
  | undefined;

const finalPosition =
  resolution.position;

const finalIndex =
  resolution.index;

let wrapperType =
  resolution.wrapperType;

// 👑 ROOT DROP
const finalTargetId =
  isRootDrop
    ? undefined
    : targetBlock!.id;


// =========================
// AUTO WRAP
// =========================

if (
  !wrapperType &&
  !isRootDrop &&
  isPrimitiveBlock(
    draggedType
  ) &&
  targetBlock!.type === "grid"
) {

  wrapperType =
    "gridItem";
}

if (
  !wrapperType &&
  !isRootDrop &&
  isPrimitiveBlock(
    draggedType
  ) &&
  targetBlock!.type === "flex"
) {

  wrapperType =
    "flexItem";
}

// wrappers ما يتغلفوش

if (
  draggedType === "gridItem" ||
  draggedType === "flexItem"
) {

  wrapperType =
    undefined;
}

// =========================
// MOVE EXISTING BLOCK
// =========================

if (
  activePayload?.isNew === false
) {

  actions.moveBlock(
    active.id.toString(),
    {
      targetId:
        finalTargetId,

      type:
        finalPosition,

      index:
        finalIndex,

      wrapperType
    }
  );

  resetDragState();

  return;
}

// =========================
// INSERT NEW BLOCK
// =========================

if (wrapperType) {

  const childConfig =
    blockRegistry[
      draggedType
    ];
console.log({
  draggedType,
  finalTargetId,
  finalPosition,
  finalIndex
});
  actions.addBlock(
    wrapperType,

    finalTargetId,

    finalPosition,

    {
      presetChildren: [
        {
          id: uuidv4(),

          type:
            draggedType,

          data: {

            props:
              structuredClone(
                childConfig
                  ?.defaultData
                  ?.props || {}
              ),

            style:
              structuredClone(
                childConfig
                  ?.defaultData
                  ?.style || {
                    desktop: {}
                  }
              )
          },

          children: []
        }
      ]
    },

    finalIndex
  );

} else {

  actions.addBlock(
    draggedType,

    finalTargetId,

    finalPosition,

    null,

    finalIndex
  );
}

resetDragState();}

  return {
    activeId,
    activeData,
    overId,
    dropPosition,
    isAllowed,
    ghost,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  };
};
