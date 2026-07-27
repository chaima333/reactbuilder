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
import React from "react";
import { presetRegistry } from "../../presets/presetRegistry";
import {
  canAcceptChild
} from "../../core/schema/canonicalSchema";

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
  rootInsertIndex?: number;
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
  ["button", "image", "text", "title", "link", "input", "select", "textarea","collectionList","form"].includes(type);

const getTopSemanticTarget = ( elements: Element[]): HTMLElement | null => {
const semanticElements = elements.filter((el) =>
      isSemanticDroppableElement(el)
    ) as HTMLElement[];

  console.log(
    "SEMANTIC ELEMENTS",
    semanticElements
  );

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
  rootInsertIndex
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
  const lastValidResolutionRef = useRef<DropState | null>(null);
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
    lastValidResolutionRef.current = null;

    resetHoverState();
  };

  const handleDragStart = (event: any) => {
    currentResolutionRef.current = null;
    lastValidResolutionRef.current = null;

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
    console.log("ðŸ”¥ HANDLE DRAG OVER CALLED", event.over?.id);

    const { active } = event;

    const draggedType =
      getDraggedType(
        active,
        blocks
      );

    console.log(
      "DRAGGED TYPE",
      draggedType
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

    // ðŸ‘‘ debug raw DOM stack
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

    console.log(
      "RAW ELEMENTS",
      elements
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

    console.log(
      "SEMANTIC ELEMENT",
      semanticElement
    );

    if (!semanticElement) {
      const lastResolution =
        lastValidResolutionRef.current;

      if (lastResolution) {
        currentResolutionRef.current =
          lastResolution;

        setOverId(
          lastResolution.targetId ===
            VIRTUAL_ROOT_ID
            ? "ROOT"
            : lastResolution.targetId
        );

        setDropPosition(
          lastResolution.position
        );

        setIsAllowed(
          lastResolution.allowed
        );

        return;
      }

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

    console.log({
      semanticElement,
      targetId
    });

    // =========================
    // ROOT DROP
    // =========================

    if (
      targetId === VIRTUAL_ROOT_ID
    ) {
      const allowed =
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

      if (allowed) {
        lastValidResolutionRef.current =
          rootResolution;
      }

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

    const insertionInfo =
      calculateInsertionIndex(
        event,
        targetBlock
      );

    // =========================
    // RESOLVER
    // =========================

    const resolution =
      resolveDropBehavior({
        draggedType,
        targetType:
          targetBlock.type,
        calculatedPosition:
          insertionInfo.position,
        calculatedIndex:
          insertionInfo.index,
        targetChildrenCount:
          targetBlock.children
            ?.length || 0
      });

    console.log(
      "RESOLUTION",
      resolution
    );

    // ðŸ‘‘ semantic debug
    setSemanticDebug({
      targetId:
        targetBlock.id,
      targetType:
        targetBlock.type,
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
        targetBlock.id
    };

    currentResolutionRef.current =
  finalResolution;

if (finalResolution.allowed) {
  lastValidResolutionRef.current =
    finalResolution;
}
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log("DRAG END");
    const { active } = event;
    console.log(
      "LAST VALID",
      lastValidResolutionRef.current
    );
   
    const currentResolution =
  currentResolutionRef.current;

const resolution =
  currentResolution?.allowed
    ? currentResolution
    : lastValidResolutionRef.current;

    console.log("RESOLUTION", resolution);

    if (!resolution || !resolution.allowed) {
      resetDragState();
      return;
    }

    const draggedType = getDraggedType(active, blocks);

    console.log("DRAGGED TYPE", draggedType);

    if (!draggedType) {
      resetDragState();
      return;
    }

    const isRootDrop =
      resolution.targetId === VIRTUAL_ROOT_ID;

    console.log("IS ROOT DROP", isRootDrop);

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
      console.log(
        "ADDING BLOCK",
        {
          draggedType,
          finalTargetId,
          finalPosition,
          finalIndex
        }
      );

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
    debugElements,
    pointerDebug,
    semanticDebug,
  };
};
