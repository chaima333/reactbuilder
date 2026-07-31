export type CmsBindingField = {
  key: string;
};

export type CmsBindingResolverOptions = {
  fallback?: string;
  maxDepth?: number;
  maxObjects?: number;
};

type ResolveState = {
  seenObjects: number;
  maxDepth: number;
  maxObjects: number;
};

const CMS_TOKEN_PATTERN =
  /\{\{\s*cms\.([A-Za-z0-9_]+)\s*\}\}/g;

const EXACT_CMS_TOKEN_PATTERN =
  /^\{\{\s*cms\.([A-Za-z0-9_]+)\s*\}\}$/;

const DANGEROUS_KEYS =
  new Set([
    "__proto__",
    "prototype",
    "constructor"
  ]);

const hasOwn = (
  value: Record<string, unknown>,
  key: string
) =>
  Object.prototype.hasOwnProperty.call(
    value,
    key
  );

const isPlainObject = (
  value: unknown
): value is Record<string, unknown> => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
};

export const isDangerousCmsBindingKey = (
  key: string
) =>
  DANGEROUS_KEYS.has(key);

export const createCmsFieldKeySet = (
  fields: CmsBindingField[] = []
) =>
  new Set(
    fields
      .map((field) =>
        String(field?.key || "").trim()
      )
      .filter((key) =>
        key && !isDangerousCmsBindingKey(key)
      )
  );

const stringifyCmsValue = (
  value: unknown,
  fallback: string
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return fallback;
};

const readCmsFieldValue = (
  entryData: Record<string, unknown>,
  fieldKeys: Set<string>,
  fieldKey: string,
  fallback: string
) => {
  if (
    isDangerousCmsBindingKey(fieldKey) ||
    !fieldKeys.has(fieldKey) ||
    !hasOwn(entryData, fieldKey)
  ) {
    return fallback;
  }

  return entryData[fieldKey] ?? fallback;
};

export const resolveCmsBindingValue = (
  value: unknown,
  entryData: Record<string, unknown>,
  fields: CmsBindingField[],
  options: CmsBindingResolverOptions = {}
): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  const fallback =
    options.fallback ?? "";

  const fieldKeys =
    createCmsFieldKeySet(fields);

  const exactMatch =
    value.match(EXACT_CMS_TOKEN_PATTERN);

  if (exactMatch) {
    return readCmsFieldValue(
      entryData,
      fieldKeys,
      exactMatch[1],
      fallback
    );
  }

  return value.replace(
    CMS_TOKEN_PATTERN,
    (_match, fieldKey: string) =>
      stringifyCmsValue(
        readCmsFieldValue(
          entryData,
          fieldKeys,
          fieldKey,
          fallback
        ),
        fallback
      )
  );
};

const resolveInternal = (
  value: unknown,
  entryData: Record<string, unknown>,
  fields: CmsBindingField[],
  options: CmsBindingResolverOptions,
  state: ResolveState,
  depth: number
): unknown => {
  if (depth > state.maxDepth) {
    return value;
  }

  if (typeof value === "string") {
    return resolveCmsBindingValue(
      value,
      entryData,
      fields,
      options
    );
  }

  if (Array.isArray(value)) {
    state.seenObjects += 1;

    if (state.seenObjects > state.maxObjects) {
      return value.slice();
    }

    return value.map((item) =>
      resolveInternal(
        item,
        entryData,
        fields,
        options,
        state,
        depth + 1
      )
    );
  }

  if (isPlainObject(value)) {
    state.seenObjects += 1;

    if (state.seenObjects > state.maxObjects) {
      return {
        ...value
      };
    }

    return Object.entries(value)
      .filter(([key]) =>
        !isDangerousCmsBindingKey(key)
      )
      .reduce<Record<string, unknown>>(
        (
          resolved,
          [key, nestedValue]
        ) => {
          resolved[key] =
            resolveInternal(
              nestedValue,
              entryData,
              fields,
              options,
              state,
              depth + 1
            );

          return resolved;
        },
        {}
      );
  }

  return value;
};

export const resolveCmsBindingsInTree = <T,>(
  value: T,
  entryData: Record<string, unknown> = {},
  fields: CmsBindingField[] = [],
  options: CmsBindingResolverOptions = {}
): T => {
  const state: ResolveState = {
    seenObjects: 0,
    maxDepth: options.maxDepth ?? 32,
    maxObjects: options.maxObjects ?? 5000
  };

  return resolveInternal(
    value,
    entryData,
    fields,
    options,
    state,
    0
  ) as T;
};
