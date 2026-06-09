// src/modules/pageBuilder/components/editor/VirtualOverlayLayer.tsx

import React, {
  useEffect,
  useState
} from "react";

import type {
  Block,
  Device
} from "../../types/page.types";

// ==========================================
// TYPES
// ==========================================

interface VirtualOverlayLayerProps {

  activeId: string | null;

  overId: string | null;

  dropPosition:
    | "before"
    | "after"
    | "inside"
    | null;

  selectedId: string | null;

  hoveredId: string | null;

  blocks: Block[];

  device: Device;
}

interface ElementRect {

  top: number;

  left: number;

  width: number;

  height: number;
}

// ==========================================
// COMPONENT
// ==========================================

export const VirtualOverlayLayer = ({

  activeId,

  overId,

  dropPosition,

  selectedId,

  hoveredId,

  blocks

}: VirtualOverlayLayerProps) => {

  const [
    selectedRect,
    setSelectedRect
  ] = useState<ElementRect | null>(null);

  const [
    hoveredRect,
    setHoveredRect
  ] = useState<ElementRect | null>(null);

  const [
    dropIndicatorRect,
    setDropIndicatorRect
  ] = useState<ElementRect | null>(null);

  // ==========================================
  // FIND BLOCK TYPE
  // ==========================================

  const findBlockTypeInTree = (
    nodes: Block[],
    id: string
  ): string | null => {

    for (const node of nodes) {

      if (node.id === id) {
        return node.type;
      }

      if (
        node.children &&
        node.children.length > 0
      ) {

        const found =
          findBlockTypeInTree(
            node.children,
            id
          );

        if (found) {
          return found;
        }
      }
    }

    return null;
  };

  // ==========================================
  // GET REAL TARGET NODE
  // ==========================================

  const getSemanticTargetNode = (
    wrapperNode: HTMLElement,
    blockType: string | null
  ): Element => {

  
    // 👑 items
    if (
      blockType === "flexItem" ||
      blockType === "gridItem"
    ) {

      if (wrapperNode.firstElementChild) {
        return wrapperNode.firstElementChild;
      }
    }

    return wrapperNode;
  };

  // ==========================================
  // GET ABSOLUTE RECT
  // ==========================================

  const getAbsoluteRect = (
    id: string | null
  ): ElementRect | null => {

    if (!id) {
      return null;
    }

    // ❌ ROOT 
    if (
      id === "ROOT" ||
      id === "canvas-root"
    ) {
      return null;
    }

    const wrapperNode =
      document.getElementById(
        `pb-runtime-${id}`
      );

    if (!wrapperNode) {
      return null;
    }

    const blockType =
      findBlockTypeInTree(
        blocks,
        id
      );

    // 👑 semantic node
    const targetNode =
      getSemanticTargetNode(
        wrapperNode,
        blockType
      );

    const rect =
      targetNode.getBoundingClientRect();

    const canvasElement =
      document.getElementById(
        "pb-virtual-canvas-root"
      );

    if (!canvasElement) {
      return null;
    }

    const canvasRect =
      canvasElement.getBoundingClientRect();

    return {

      top:
        rect.top -
        canvasRect.top,

      left:
        rect.left -
        canvasRect.left,

      width:
        rect.width,

      height:
        rect.height
    };
  };

  // ==========================================
  // EFFECT
  // ==========================================

  useEffect(() => {

    const updateRects = () => {

      setSelectedRect(
        getAbsoluteRect(
          selectedId
        )
      );

      setHoveredRect(
        getAbsoluteRect(
          hoveredId &&
          hoveredId !== selectedId
            ? hoveredId
            : null
        )
      );

      if (overId) {

        setDropIndicatorRect(
          getAbsoluteRect(
            overId
          )
        );

      } else {

        setDropIndicatorRect(
          null
        );
      }
    };

    updateRects();

    window.addEventListener(
      "scroll",
      updateRects
    );

    window.addEventListener(
      "resize",
      updateRects
    );

    const observer =
      new MutationObserver(
        updateRects
      );

    observer.observe(
      document.body,
      {

        attributes: true,

        childList: true,

        subtree: true
      }
    );

    return () => {

      window.removeEventListener(
        "scroll",
        updateRects
      );

      window.removeEventListener(
        "resize",
        updateRects
      );

      observer.disconnect();
    };

  }, [

    selectedId,

    hoveredId,

    overId,

    blocks,

    activeId
  ]);

  // ==========================================
  // RENDER
  // ==========================================

  return (

    <div
      className="virtual-overlay-layer-container"
      style={{

        position: "absolute",

        top: 0,

        left: 0,

        width: "100%",

        height: "100%",

        pointerEvents: "none",

        zIndex: 999,

        overflow: "visible"
      }}
    >

      {/* ====================================== */}
      {/* SELECTED */}
      {/* ====================================== */}

      {selectedRect && (

        <div
          className="pb-selection-overlay"
          style={{

            position: "absolute",

            top:
              selectedRect.top,

            left:
              selectedRect.left,

            width:
              selectedRect.width,

            height:
              selectedRect.height,

            border:
              "2px solid #1976d2",

            borderRadius: "6px",

            boxSizing:
              "border-box",

            transition:
              "all 0.1s ease-out"
          }}
        />
      )}

      {/* ====================================== */}
      {/* HOVER */}
      {/* ====================================== */}

      {hoveredRect && (

        <div
          className="pb-hover-overlay"
          style={{

            position: "absolute",

            top:
              hoveredRect.top,

            left:
              hoveredRect.left,

            width:
              hoveredRect.width,

            height:
              hoveredRect.height,

            outline:
              "2px dashed #00bcd4",

            outlineOffset:
              "-2px",

            borderRadius: "6px",

            boxSizing:
              "border-box"
          }}
        />
      )}

      {/* ====================================== */}
      {/* DROP INDICATOR */}
      {/* ====================================== */}

      {activeId &&
        overId &&
        dropIndicatorRect &&
        dropPosition && (

        <div
          className="pb-drop-indicator-overlay"
          style={{

            position: "absolute",

            top:
              dropIndicatorRect.top,

            left:
              dropIndicatorRect.left,

            width:
              dropIndicatorRect.width,

            pointerEvents:
              "none",

            boxSizing:
              "border-box",

            transition:
              "all 0.12s ease-in-out",

            zIndex: 1000,

            ...(dropPosition === "inside"

              ? {

                  height:
                    dropIndicatorRect.height,

                  border:
                    "2px dashed #1976d2",

                  backgroundColor:
                    "rgba(25,118,210,0.08)",

                  borderRadius: "6px"
                }

              : dropPosition === "before"

              ? {

                  height: "4px",

                  backgroundColor:
                    "#1976d2",

                  transform:
                    "translateY(-2px)",

                  borderRadius:
                    "2px"
                }

              : {

                  height: "4px",

                  top:
                    dropIndicatorRect.top +
                    dropIndicatorRect.height,

                  backgroundColor:
                    "#1976d2",

                  transform:
                    "translateY(-2px)",

                  borderRadius:
                    "2px"
                }
            )
          }}
        />

      )}

    </div>
  );
};