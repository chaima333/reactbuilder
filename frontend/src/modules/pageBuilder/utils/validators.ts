export type ValidationRules = {
  required?: boolean;
  cssUnit?: boolean;
  url?: boolean;
  number?: boolean;
  min?: number;
  max?: number;
};

export const validateField = (value: any, rules?: ValidationRules): string | null => {
  if (!rules) return null;

  // 1. Required
  if (rules.required && (!value || value.toString().trim() === "")) {
    return "This field is required";
  }

  if (!value) return null; // إذا موش required وفارغ، نتعداو

  // 2. CSS Unit (px, rem, em, %, vh, vw)
  if (rules.cssUnit) {
    const cssRegex = /^(-?\d*\.?\d+)(px|rem|em|%|vh|vw|pt|pc|in|cm|mm)$/;
    if (!cssRegex.test(value)) {
      return "Invalid CSS unit (e.g., 16px, 1.5rem)";
    }
  }

  // 3. URL
  if (rules.url) {
    try {
      if (value !== "#") new URL(value);
    } catch {
      return "Please enter a valid URL";
    }
  }

  // 4. Numbers
  if (rules.number) {
    if (isNaN(Number(value))) return "Must be a number";
    if (rules.min !== undefined && Number(value) < rules.min) return `Min value is ${rules.min}`;
    if (rules.max !== undefined && Number(value) > rules.max) return `Max value is ${rules.max}`;
  }

  return null;
};