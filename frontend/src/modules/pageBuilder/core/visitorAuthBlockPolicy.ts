import type {
  Block
} from "../types/page.types";

export type PageSystemType =
  | "visitor_login"
  | "visitor_register"
  | null
  | undefined;

export type VisitorAuthBlockType =
  | "visitorLogin"
  | "visitorRegister";

export const isVisitorAuthBlockType = (
  type: unknown
): type is VisitorAuthBlockType =>
  type === "visitorLogin" ||
  type === "visitorRegister";

export const countVisitorAuthBlocks = (
  blocks: Block[] | undefined
) => {
  const counts = {
    visitorLogin: 0,
    visitorRegister: 0
  };

  const visit = (
    items: Block[] | undefined
  ) => {
    if (!Array.isArray(items)) {
      return;
    }

    for (const block of items) {
      if (block.type === "visitorLogin") {
        counts.visitorLogin += 1;
      }

      if (block.type === "visitorRegister") {
        counts.visitorRegister += 1;
      }

      visit(block.children);
    }
  };

  visit(blocks);

  return counts;
};

export const findBlockById = (
  blocks: Block[] | undefined,
  id: string
): Block | null => {
  if (!Array.isArray(blocks)) {
    return null;
  }

  for (const block of blocks) {
    if (block.id === id) {
      return block;
    }

    const found =
      findBlockById(
        block.children,
        id
      );

    if (found) {
      return found;
    }
  }

  return null;
};

export const canDeleteBlockForPage = ({
  blocks,
  blockId,
  systemType
}: {
  blocks: Block[];
  blockId: string;
  systemType: PageSystemType;
}) => {
  const block =
    findBlockById(
      blocks,
      blockId
    );

  if (!block) {
    return true;
  }

  if (
    systemType === "visitor_login" &&
    block.type === "visitorLogin"
  ) {
    return false;
  }

  if (
    systemType === "visitor_register" &&
    block.type === "visitorRegister"
  ) {
    return false;
  }

  return true;
};

export const canDuplicateBlockForPage = ({
  blocks,
  blockId,
  systemType
}: {
  blocks: Block[];
  blockId: string;
  systemType: PageSystemType;
}) => {
  const block =
    findBlockById(
      blocks,
      blockId
    );

  if (
    block &&
    isVisitorAuthBlockType(block.type)
  ) {
    return false;
  }

  if (
    systemType === "visitor_login" ||
    systemType === "visitor_register"
  ) {
    return !block ||
      !isVisitorAuthBlockType(block.type);
  }

  return true;
};

export const canAddVisitorAuthBlockForPage = ({
  blocks,
  type,
  systemType
}: {
  blocks: Block[];
  type: unknown;
  systemType: PageSystemType;
}) => {
  if (!isVisitorAuthBlockType(type)) {
    return true;
  }

  const counts =
    countVisitorAuthBlocks(blocks);

  if (
    systemType === "visitor_login"
  ) {
    return false;
  }

  if (
    systemType === "visitor_register"
  ) {
    return false;
  }

  if (
    type === "visitorLogin"
  ) {
    return counts.visitorLogin === 0 &&
      counts.visitorRegister === 0;
  }

  return counts.visitorRegister === 0 &&
    counts.visitorLogin === 0;
};
