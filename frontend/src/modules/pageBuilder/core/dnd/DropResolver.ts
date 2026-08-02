import { BlockType } from "../../types/page.types";
import {
  canAcceptChild,
  getWrapperRule
} from "../schema/canonicalSchema";

export interface DropResolution {
  allowed: boolean;
  position: "before" | "after" | "inside";
  index: number;
  autoWrap?: boolean;
  wrapperType?: "gridItem" | "flexItem";
}

interface ResolveDropParams {
  draggedType: BlockType;
  targetType: BlockType;
  calculatedPosition: "before" | "after" | "inside";
  calculatedIndex: number;
  targetChildrenCount: number;
}

const denied = (
  calculatedPosition: ResolveDropParams["calculatedPosition"],
  calculatedIndex: number
): DropResolution => ({
  allowed: false,
  position: calculatedPosition,
  index: calculatedIndex
});

const inside = (
  index: number,
  extra: Partial<DropResolution> = {}
): DropResolution => ({
  allowed: true,
  position: "inside",
  index,
  ...extra
});

export const resolveDropBehavior = ({
  draggedType,
  targetType,
  calculatedPosition,
  calculatedIndex,
  targetChildrenCount
}: ResolveDropParams): DropResolution => {
  const defaultIndex = targetChildrenCount;

  const effectiveDraggedType =
    ["hero", "cta",  "faq", "features"].includes(draggedType)
      ? "section"
      : draggedType;

  if (calculatedPosition !== "inside") {
    if (canAcceptChild(targetType, effectiveDraggedType)) {
      return {
        allowed: true,
        position: calculatedPosition,
        index: calculatedIndex
      };
    }

    const wrapperRule = getWrapperRule(targetType, effectiveDraggedType);

    if (
      wrapperRule &&
      (targetType === "flex" || targetType === "grid")
    ) {
      return {
        allowed: true,
        position: calculatedPosition,
        index: calculatedIndex,
        autoWrap: true,
        wrapperType: wrapperRule.wrapper as "gridItem" | "flexItem"
      };
    }

    return denied(calculatedPosition, calculatedIndex);
  }

  if (
    (targetType === "navbar" || targetType === "footer") &&
    ["image", "text", "link", "button", "title", "flexItem"].includes(
      effectiveDraggedType
    )
  ) {
    return inside(defaultIndex, {
      autoWrap: effectiveDraggedType !== "flexItem",
      wrapperType:
        effectiveDraggedType === "flexItem"
          ? undefined
          : "flexItem"
    });
  }

  if (
    targetType === "section" &&
    ["title", "text", "button", "image", "link"].includes(effectiveDraggedType)
  ) {
    return inside(defaultIndex);
  }

  if (canAcceptChild(targetType, effectiveDraggedType)) {
    return inside(defaultIndex);
  }

  const wrapperRule = getWrapperRule(targetType, effectiveDraggedType);

  if (wrapperRule) {
    return inside(defaultIndex, {
      autoWrap: true,
      wrapperType: wrapperRule.wrapper as "gridItem" | "flexItem"
    });
  }

  return denied(calculatedPosition, calculatedIndex);
};
