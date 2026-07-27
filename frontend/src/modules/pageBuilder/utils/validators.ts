export type ValidationRules = {
  required?: boolean;
  cssUnit?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
};

const normalizeCssValue = (
  value: unknown
): string =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[٪﹪％]/g, "%");

export const validateField = (
  value: unknown,
  rules?: ValidationRules
): string | null => {
  if (!rules) {
    return null;
  }

  const normalizedValue =
    String(value ?? "").trim();

  if (
    rules.required &&
    normalizedValue === ""
  ) {
    return "This field is required";
  }

  if (normalizedValue === "") {
    return null;
  }

  if (rules.cssUnit) {
    const cssValue =
      normalizeCssValue(value);

    const fallbackRegex =
      /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vh|vw|vmin|vmax|pt|pc|in|cm|mm|ch|ex)$/i;

    const keywords = new Set([
      "0",
      "auto",
      "inherit",
      "initial",
      "unset",
      "min-content",
      "max-content",
      "fit-content"
    ]);

    const browserAccepts =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("width", cssValue);

    const isValid =
      browserAccepts ||
      fallbackRegex.test(cssValue) ||
      keywords.has(cssValue.toLowerCase()) ||
      /^(?:calc|min|max|clamp)\(.+\)$/i.test(cssValue);

    if (!isValid) {
      return "Invalid CSS value (e.g., 40px, 100%, 1.5rem, auto)";
    }
  }

  if (rules.url) {
    try {
      if (
        normalizedValue !== "#" &&
        !normalizedValue.startsWith("/") &&
        !normalizedValue.startsWith("./") &&
        !normalizedValue.startsWith("../")
      ) {
        new URL(normalizedValue);
      }
    } catch {
      return "Please enter a valid URL";
    }
  }

  if (rules.number) {
    const numericValue =
      Number(normalizedValue);

    if (Number.isNaN(numericValue)) {
      return "Must be a number";
    }

    if (
      rules.min !== undefined &&
      numericValue < rules.min
    ) {
      return `Min value is ${rules.min}`;
    }

    if (
      rules.max !== undefined &&
      numericValue > rules.max
    ) {
      return `Max value is ${rules.max}`;
    }
  }

  return null;
};
