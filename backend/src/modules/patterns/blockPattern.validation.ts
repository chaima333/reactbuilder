export const PATTERN_ERRORS = {
  NAME_REQUIRED: "PATTERN_NAME_REQUIRED",
  NAME_TOO_LONG: "PATTERN_NAME_TOO_LONG",
  ROOT_BLOCK_REQUIRED: "PATTERN_ROOT_BLOCK_REQUIRED",
  ROOT_MUST_BE_SECTION: "PATTERN_ROOT_MUST_BE_SECTION",
  TREE_INVALID: "PATTERN_TREE_INVALID",
  DUPLICATE_BLOCK_ID: "PATTERN_DUPLICATE_BLOCK_ID",
  NOT_FOUND: "PATTERN_NOT_FOUND"
} as const;

const MAX_PATTERN_NAME_LENGTH = 120;
const MAX_TREE_DEPTH = 40;
const MAX_BLOCK_COUNT = 500;
const POLLUTION_KEYS = new Set([
  "__proto__",
  "prototype",
  "constructor"
]);

export type ValidatedPatternInput = {
  name: string;
  description: string | null;
  rootBlock: Record<string, any>;
  metadata: Record<string, any>;
};

const isPlainObject = (
  value: unknown
): value is Record<string, any> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

const assertNoUnsafeKeys = (
  value: unknown
) => {
  if (Array.isArray(value)) {
    value.forEach(assertNoUnsafeKeys);
    return;
  }

  if (!isPlainObject(value)) {
    return;
  }

  for (const key of Object.keys(value)) {
    if (POLLUTION_KEYS.has(key)) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    assertNoUnsafeKeys(value[key]);
  }
};

export const safeJsonCopy = <T>(value: T): T => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    throw new Error(PATTERN_ERRORS.TREE_INVALID);
  }
};

export const validatePatternName = (
  value: unknown
): string => {
  const name =
    typeof value === "string"
      ? value.trim()
      : "";

  if (!name) {
    throw new Error(PATTERN_ERRORS.NAME_REQUIRED);
  }

  if (name.length > MAX_PATTERN_NAME_LENGTH) {
    throw new Error(PATTERN_ERRORS.NAME_TOO_LONG);
  }

  return name;
};

export const validateRootBlock = (
  value: unknown
): Record<string, any> => {
  if (value === undefined || value === null) {
    throw new Error(PATTERN_ERRORS.ROOT_BLOCK_REQUIRED);
  }

  assertNoUnsafeKeys(value);

  const rootBlock =
    safeJsonCopy(value);

  if (!isPlainObject(rootBlock)) {
    throw new Error(PATTERN_ERRORS.TREE_INVALID);
  }

  if (rootBlock.type !== "section") {
    throw new Error(PATTERN_ERRORS.ROOT_MUST_BE_SECTION);
  }

  const seenIds =
    new Set<string>();

  let blockCount = 0;

  const visit = (
    block: unknown,
    depth: number
  ) => {
    if (depth > MAX_TREE_DEPTH) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    if (!isPlainObject(block)) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    blockCount += 1;

    if (blockCount > MAX_BLOCK_COUNT) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    if (
      typeof block.id !== "string" ||
      !block.id.trim()
    ) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    if (seenIds.has(block.id)) {
      throw new Error(PATTERN_ERRORS.DUPLICATE_BLOCK_ID);
    }

    seenIds.add(block.id);

    if (
      typeof block.type !== "string" ||
      !block.type.trim()
    ) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    if (!isPlainObject(block.data)) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    if (!Array.isArray(block.children)) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    block.children.forEach((child) =>
      visit(child, depth + 1)
    );
  };

  visit(rootBlock, 1);

  return rootBlock;
};

export const validatePatternPayload = (
  payload: any,
  options: {
    partial?: boolean;
  } = {}
): Partial<ValidatedPatternInput> => {
  const result:
    Partial<ValidatedPatternInput> = {};

  if (!options.partial || payload?.name !== undefined) {
    result.name =
      validatePatternName(payload?.name);
  }

  if (payload?.description !== undefined) {
    const description =
      payload.description === null
        ? null
        : String(payload.description).trim();

    result.description =
      description || null;
  } else if (!options.partial) {
    result.description = null;
  }

  if (!options.partial || payload?.rootBlock !== undefined) {
    result.rootBlock =
      validateRootBlock(payload?.rootBlock);
  }

  if (payload?.metadata !== undefined) {
    if (!isPlainObject(payload.metadata)) {
      throw new Error(PATTERN_ERRORS.TREE_INVALID);
    }

    assertNoUnsafeKeys(payload.metadata);
    result.metadata =
      safeJsonCopy(payload.metadata);
  } else if (!options.partial) {
    result.metadata = {};
  }

  return result;
};
