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
import {
  findBlockInTree,
  findParentInTree
} from "../../core/tree/utils";
import { Block, BlockType } from "../../types/page.types";
import { VIRTUAL_ROOT_ID } from "../../components/editor/EditorCanvas";
import React from "react";
import { presetRegistry } from "../../presets/presetRegistry";
import {
  canAcceptChild
} from "../../core/schema/canonicalSchema";
import {
  canMoveWithinDndSlots,
  DndSlot
} from "../../core/dnd/dndSlots";

interface InsertionResult {
  position: "before" | "after" | "inside";
  index: number;
}

interface DestinationContext {
  targetId: string;
  parentId: string;
  parentType: BlockType;
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
  rootInsertIndex?: number;
  resolveDndSlot?: (
    blockId?: string
  ) => DndSlot;
  actions: {
    addBlock: (
      type: string,
      targetId?: string,
      position?: string,
      presetData?: any,
      insertIndex?: number
    ) => void;
    addBlockTree: (
      tree: Block,
      targetId?: string,
      position?: string,
      insertIndex?: number
    ) => void;
    moveBlock: (
      blockId: string,
      location: {
        targetId?: string;
        position:
          | "before"
          | "after"
          | "inside";
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
  targetBlock: Block,
  blocks: Block[],
  activeId: string,
  pointerY?: number
): InsertionResult => {
  const { over } = event;

  if (!over || typeof pointerY !== "number") {
    return { position: "inside", index: targetBlock.children?.length || 0 };
  }

  const overId = over.id.toString();
  const targetElement = document.getElementById(`pb-runtime-${overId}`);

  if (overId === targetBlock.id && targetElement) {
    // Fix: flexItem → flex should always be "inside"
    if (
      targetBlock.type === "flex" &&
      findBlockInTree(blocks, activeId)?.type === "flexItem"
    ) {
      return {
        position: "inside",
        index: targetBlock.children?.length || 0
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const relativeY = (pointerY - rect.top) / rect.height;
    const targetParent =
      findParentInTree(
        blocks,
        targetBlock.id
      );
    const siblings =
      targetParent?.children ||
      blocks;
    const targetIndex =
      siblings.findIndex(
        (child) =>
          child.id === targetBlock.id
      );
    const rawIndex =
      relativeY < 0.5
        ? targetIndex
        : targetIndex + 1;
    const sourceParent =
      findParentInTree(
        blocks,
        activeId
      );
    const sourceSiblings =
      sourceParent?.children ||
      blocks;
    const sourceIndex =
      sourceSiblings.findIndex(
        (child) =>
          child.id === activeId
      );
    const sameParent =
      (sourceParent?.id || VIRTUAL_ROOT_ID) ===
      (targetParent?.id || VIRTUAL_ROOT_ID);
    const adjustedIndex =
      sameParent &&
      sourceIndex > -1 &&
      sourceIndex < rawIndex
        ? rawIndex - 1
        : rawIndex;

    return {
      position: relativeY < 0.5 ? "before" : "after",
      index: Math.max(0, adjustedIndex)
    };
  }

  const children = targetBlock.children || [];

  if (!children.length) {
    return { position: "inside", index: 0 };
  }

  const childIndex = children.findIndex((child) => child.id === overId);

  if (childIndex === -1) {
    return { position: "inside", index: children.length };
  }

  if (!targetElement) {
    return { position: "inside", index: children.length };
  }

  const rect = targetElement.getBoundingClientRect();
  const relativeY = (pointerY - rect.top) / rect.height;

  if (relativeY < 0.5) {
    return { position: "before", index: childIndex };
  }

  return { position: "after", index: childIndex + 1 };
};

const isDescendantOf = (
  block: Block,
  possibleDescendantId: string
): boolean =>
  (block.children || []).some(
    (child) =>
      child.id === possibleDescendantId ||
      isDescendantOf(
        child,
        possibleDescendantId
      )
  );

const isLocked = (
  block: Block
): boolean =>
  Boolean(
    block.meta?.isLocked ||
    (block.data as any)?.meta?.isLocked
  );

const getDestinationContext = (
  blocks: Block[],
  targetBlock: Block,
  insertionInfo: InsertionResult
): DestinationContext => {
  if (
    insertionInfo.position ===
    "inside"
  ) {
    return {
      targetId: targetBlock.id,
      parentId: targetBlock.id,
      parentType: targetBlock.type,
      position: "inside",
      index: insertionInfo.index
    };
  }

  const parent =
    findParentInTree(
      blocks,
      targetBlock.id
    );

  return {
    targetId: targetBlock.id,
    parentId:
      parent?.id ||
      VIRTUAL_ROOT_ID,
    parentType:
      parent?.type ||
      "root",
    position:
      insertionInfo.position,
    index:
      insertionInfo.index
  };
};

const canMoveToDestination = (
  movingBlock: Block,
  destination: DestinationContext,
  destinationContainer?: Block | null
): boolean => {
  if (isLocked(movingBlock)) {
    return false;
  }

  if (
    destinationContainer &&
    isLocked(destinationContainer)
  ) {
    return false;
  }

  if (
    movingBlock.id ===
      destination.targetId ||
    movingBlock.id ===
      destination.parentId
  ) {
    return false;
  }

  if (
    isDescendantOf(
      movingBlock,
      destination.parentId
    ) ||
    isDescendantOf(
      movingBlock,
      destination.targetId
    )
  ) {
    return false;
  }

  return true;
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
  ["button", "image", "text", "title", "link", "input", "select", "textarea","collectionList","form"].includes(type);

const isNewPaletteDrag = (
  active: DragOverEvent["active"] | DragEndEvent["active"]
): boolean =>
  active.data.current?.isNew === true;

const canUseCrossSlotGuard = (
  active: DragOverEvent["active"] | DragEndEvent["active"],
  blocks: Block[]
): boolean =>
  !isNewPaletteDrag(active) &&
  Boolean(
    findBlockInTree(
      blocks,
      active.id.toString()
    )
  );

const resolveSlotAllowed = (
  active: DragOverEvent["active"] | DragEndEvent["active"],
  blocks: Block[],
  resolveDndSlot: UseDragAndDropProps["resolveDndSlot"],
  targetSlot: DndSlot,
  targetId?: string
): boolean => {
  if (
    !resolveDndSlot ||
    !canUseCrossSlotGuard(
      active,
      blocks
    )
  ) {
    return true;
  }

  return canMoveWithinDndSlots(
    resolveDndSlot(
      active.id.toString()
    ),
    targetSlot,
    targetId
  );
};

const getTopSemanticTarget = ( elements: Element[]): HTMLElement | null => {
const semanticElements = elements.filter((el) =>
      isSemanticDroppableElement(el)
    ) as HTMLElement[];

  if (!semanticElements.length) { return null; }

  return (
    semanticElements.find(
      (el) =>
        el.dataset.blockType !==
        "root"
    ) || semanticElements[0]
  );
};

const normalizeTree = (
  node: any
): any => {
  return {
    ...node,
    id:
      node.id ||
      crypto.randomUUID(),
    children:
      (node.children || []).map(
        normalizeTree
      )
  };
};

export const useDragAndDrop = ({
  blocks,
  actions,
  rootInsertIndex,
  resolveDndSlot
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
  const pointerPositionRef =
  useRef({
    x: 0,
    y: 0
  });

useEffect(() => {
  if (!activeId) {
    return;
  }

  const handleMove = (
    event: PointerEvent
  ) => {
    pointerPositionRef.current = {
      x: event.clientX,
      y: event.clientY
    };

    setGhost({
      x: event.clientX + 15,
      y: event.clientY + 15
    });
  };

  window.addEventListener(
    "pointermove",
    handleMove
  );

  return () =>
    window.removeEventListener(
      "pointermove",
      handleMove
    );
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

    currentResolutionRef.current = null;
    resetHoverState();
  };

  const handleDragStart = (event: any) => {
    currentResolutionRef.current = null;

    setOverId(null);
    setDropPosition(null);
    setIsAllowed(true);

    setActiveId(
      event.active.id.toString()
    );

    setActiveData(
      event.active.data.current
    );
    const activatorEvent =
  event.activatorEvent as
    | PointerEvent
    | MouseEvent
    | undefined;

if (
  activatorEvent &&
  typeof activatorEvent.clientX ===
    "number"
) {
  pointerPositionRef.current = {
    x: activatorEvent.clientX,
    y: activatorEvent.clientY
  };
}
  };

  const [
    debugElements,
    setDebugElements
  ] = React.useState<any[]>([]);

  const [
    pointerDebug,
    setPointerDebug
  ] = React.useState({
    x: 0,
    y: 0
  });

  const [
    semanticDebug,
    setSemanticDebug
  ] = React.useState({
    targetId: null as string | null,
    targetType: null as string | null,
    allowed: null as boolean | null
  });

  const handleDragOver = (
    event: DragOverEvent
  ) => {
    const { active } = event;

    const draggedType =
      getDraggedType(
        active,
        blocks
      );

    if (!draggedType) {
      resetDragState();
      return;
    }

    const effectiveDraggedType =
      presetRegistry[
        draggedType as keyof typeof presetRegistry
      ]
        ? "section"
        : draggedType;

    // INVALID DRAG
    // =========================

    if (!draggedType) {
      resetHoverState();
      return;
    }

    // =========================
    // POINTER EVENT
    // =========================
   let pointerX =
  pointerPositionRef.current.x;

let pointerY =
  pointerPositionRef.current.y;

if (
  pointerX === 0 &&
  pointerY === 0
) {
  const translatedRect =
    active.rect.current.translated;

  if (translatedRect) {
    pointerX =
      translatedRect.left +
      translatedRect.width / 2;

    pointerY =
      translatedRect.top +
      translatedRect.height / 2;
  }
}

    const elements =
      document.elementsFromPoint(
        pointerX,
        pointerY
      );

    setDebugElements(
      elements.map((el) => ({
        tag: el.tagName,
        id:
          (el as HTMLElement).id,
        className:
          (el as HTMLElement)
            .className
      }))
    );

    // =========================
    // SEMANTIC TARGET
    // =========================

    const semanticElement =
      getTopSemanticTarget(
        elements
      );
      
    setSemanticDebug({
      targetId:
        semanticElement
          ?.dataset.blockId ||
        null,
      targetType:
        semanticElement
          ?.dataset.blockType ||
        null,
      allowed: null
    });

    if (!semanticElement) {
      resetHoverState();
      return;
    }

    // =========================
    // TARGET ID
    // =========================

    const targetId =
      getSemanticDroppableId(
        semanticElement
      );

    // =========================
    // ROOT DROP
    // =========================

    if (
      targetId === VIRTUAL_ROOT_ID
    ) {
      const movingBlock =
        findBlockInTree(
          blocks,
          active.id.toString()
        );
      const canAttemptMove =
        !movingBlock ||
        canMoveToDestination(
          movingBlock,
          {
            targetId: VIRTUAL_ROOT_ID,
            parentId: VIRTUAL_ROOT_ID,
            parentType: "root",
            position: "inside",
            index: rootInsertIndex ?? blocks.length
          },
          null
        );
      const allowed =
        canAttemptMove &&
        (
          resolveSlotAllowed(
            active,
            blocks,
            resolveDndSlot,
            "page",
            VIRTUAL_ROOT_ID
          )
        ) &&
        canAcceptChild(
          "root",
          effectiveDraggedType
        );

      const rootResolution: DropState = {
        allowed,
        position: "inside",
        index: rootInsertIndex ?? blocks.length,
        targetId: VIRTUAL_ROOT_ID
      };

      setOverId("ROOT");
      setDropPosition("inside");
      setIsAllowed(allowed);

      setSemanticDebug({
        targetId: VIRTUAL_ROOT_ID,
        targetType: "root",
        allowed
      });

      currentResolutionRef.current =
        rootResolution;

      return;
    }

    // =========================
    // TARGET BLOCK
    // =========================

    const targetBlock =
      findBlockInTree(
        blocks,
        targetId
      );

    if (!targetBlock) {
      resetHoverState();
      currentResolutionRef.current =
        null;
      return;
    }

    // =========================
    // INSERTION INFO
    // =========================

    const rawInsertionInfo =
      calculateInsertionIndex(
        event,
        targetBlock,
        blocks,
        active.id.toString(),
        pointerY
      );
    const insertionInfo =
      isNewPaletteDrag(active) &&
      !(targetBlock.children || []).length
        ? {
            position: "inside" as const,
            index: 0
          }
        : rawInsertionInfo;

    // =========================
    // RESOLVER
    // =========================

    const destination =
      getDestinationContext(
        blocks,
        targetBlock,
        insertionInfo
      );
    const destinationParent =
      destination.parentId === VIRTUAL_ROOT_ID
        ? null
        : findBlockInTree(
            blocks,
            destination.parentId
          );
    const destinationChildrenCount =
      destination.position === "inside"
        ? targetBlock.children?.length || 0
        : destinationParent?.children?.length ||
          blocks.length;
    const movingBlock =
      findBlockInTree(
        blocks,
        active.id.toString()
      );
    const canAttemptMove =
      !movingBlock ||
      canMoveToDestination(
        movingBlock,
        destination,
        destination.position === "inside"
          ? targetBlock
          : destinationParent
      );
    const targetSlot =
      resolveDndSlot
        ? resolveDndSlot(
            destination.targetId
          )
        : "page";
    const slotAllowed =
      resolveSlotAllowed(
        active,
        blocks,
        resolveDndSlot,
        targetSlot,
        destination.targetId
      );

    const resolvedDrop =
      resolveDropBehavior({
        draggedType,
        targetType:
          destination.parentType,
        calculatedPosition:
          destination.position,
        calculatedIndex:
          destination.index,
        targetChildrenCount:
          destinationChildrenCount
      });
    const resolution = {
      ...resolvedDrop,
      allowed:
        canAttemptMove &&
        slotAllowed &&
        resolvedDrop.allowed
    };

    setSemanticDebug({
      targetId:
        targetBlock.id,
      targetType:
        destination.parentType,
      allowed:
        resolution.allowed
    });

    // =========================
    // UI STATE
    // =========================

    setOverId(
      targetBlock.id
    );

    setDropPosition(
      resolution.position
    );

    setIsAllowed(
      resolution.allowed
    );

    // =========================
    // CURRENT RESOLUTION REF
    // =========================

    const finalResolution = {
      ...resolution,
      targetId:
        destination.targetId
    };

    currentResolutionRef.current =
  finalResolution;

  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
   
    const currentResolution =
  currentResolutionRef.current;

const resolution =
  currentResolution;

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
      | {type: BlockType; isNew: boolean;}
      | undefined;

    const finalPosition = resolution.position;
    const finalIndex = resolution.index;
    const presetFactory =
      presetRegistry[
        draggedType as keyof typeof presetRegistry
      ];

    let wrapperType = resolution.wrapperType;

    const finalTargetId =
      isRootDrop
        ? "ROOT"
        : targetBlock!.id;

    const isPresetDrop = !!presetFactory;
    
    // =========================
    // AUTO WRAP
    // =========================

    if (
      !isPresetDrop &&
      !wrapperType &&
      !isRootDrop &&
      isPrimitiveBlock(
        draggedType
      ) &&
      targetBlock!.type === "grid"
    ) {
      wrapperType = "gridItem";
    }

    if (
      !isPresetDrop &&
      !wrapperType &&
      !isRootDrop &&
      isPrimitiveBlock(
        draggedType
      ) &&
      targetBlock!.type === "flex"
    ) {
      wrapperType = "flexItem";
    }

    if (
      !isPresetDrop &&
      !wrapperType &&
      !isRootDrop &&
      isPrimitiveBlock(draggedType) &&
      (
        targetBlock!.type === "navbar" ||
        targetBlock!.type === "footer"
      )
    ) {
      wrapperType = "flexItem";
    }

    if (
      draggedType === "gridItem" ||
      draggedType === "flexItem"
    ) {
      wrapperType = undefined;
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
          position:
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

    if (presetFactory) {
      const presetTree =
        (presetFactory as any)({});

      let presetPosition =
        finalPosition;

      if (
        targetBlock?.type === "section" &&
        finalPosition === "inside"
      ) {
        presetPosition =
          "after";
      }

      const normalizedTree =
        normalizeTree(
          presetTree
        );

      actions.addBlockTree(
        normalizedTree,
        finalTargetId,
        presetPosition,
        finalIndex
      );

      resetDragState();
      return;
    }

    // primitive dropped on section
    if (
      !isPresetDrop &&
      !isRootDrop &&
      isPrimitiveBlock(draggedType) &&
      targetBlock!.type === "section"
    ) {
      const existingFlex = targetBlock!.children?.find(
        (child) => child.type === "flex"
      );

      if (existingFlex) {
    const childConfig =
      blockRegistry[draggedType];

    actions.addBlock(
      "flexItem",
      existingFlex.id,
      "inside",
      {
        presetChildren: [
          {
            id: uuidv4(),
            type: draggedType,
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
      existingFlex.children?.length || 0
    );

    resetDragState();
    return;
  }

      const childConfig = blockRegistry[draggedType];

      actions.addBlockTree(
        {
          id: uuidv4(),
          type: "flex",
          data: {
            props: {},
            style: {
              desktop: {
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                width: "100%"
              }
            }
          },
          children: [
            {
              id: uuidv4(),
              type: "flexItem",
              data: {
                props: {},
                style: {
                  desktop: {
                    width: "100%"
                  }
                }
              },
              children: [
                {
                  id: uuidv4(),
                  type: draggedType,
                  data: {
                    props: structuredClone(childConfig?.defaultData?.props || {}),
                    style: structuredClone(
                      childConfig?.defaultData?.style || { desktop: {} }
                    )
                  },
                  children: []
                }
              ]
            }
          ]
        },
        finalTargetId,
        "inside",
        finalIndex
      );

      resetDragState();
      return;
    }

    if (wrapperType) {
      const childConfig = blockRegistry[draggedType];

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

    resetDragState();
  };

  const handleDragCancel = () => {
    resetDragState();
  };

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
    handleDragCancel,
    debugElements,
    pointerDebug,
    semanticDebug,
  };
};