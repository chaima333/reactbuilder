export const stripJsonMarkdownFence = (
  value: string
) =>
  value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

export const extractJsonObjectText = (
  value: string
) => {
  const clean =
    stripJsonMarkdownFence(value);

  const firstObject =
    clean.indexOf("{");

  const lastObject =
    clean.lastIndexOf("}");

  if (
    firstObject >= 0 &&
    lastObject > firstObject
  ) {
    return clean.slice(
      firstObject,
      lastObject + 1
    );
  }

  const firstArray =
    clean.indexOf("[");

  const lastArray =
    clean.lastIndexOf("]");

  if (
    firstArray >= 0 &&
    lastArray > firstArray
  ) {
    return clean.slice(
      firstArray,
      lastArray + 1
    );
  }

  return clean;
};

export const safeParseAiJson = <T>(
  value: string
): {
  success: boolean;
  data: T | null;
  errorMessage?: string;
} => {
  try {
    const jsonText =
      extractJsonObjectText(value);

    return {
      success: true,
      data:
        JSON.parse(jsonText) as T
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errorMessage:
        error instanceof Error
          ? error.message
          : String(error)
    };
  }
};

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  !!value &&
  typeof value === "object" &&
  !Array.isArray(value);

export const ensureArray = <T>(
  value: T[] | null | undefined
): T[] =>
  Array.isArray(value)
    ? value
    : [];