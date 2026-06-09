const CSS_VAR_PATTERN =
  /^var\(\s*(--[^,\s)]+)\s*(?:,\s*(.+))?\)$/;

const TOKEN_ALIASES:
Record<string, string[]> = {
  "--display-xl": [
    "typography.displayXL.fontSize",
    "typography.hero"
  ],
  "--heading-lg": [
    "typography.displayLG.fontSize",
    "typography.heading"
  ],
  "--body-md": [
    "typography.bodyMD.fontSize",
    "typography.body"
  ],
  "--caption": [
    "typography.caption"
  ],
  "--spacing-hero": [
    "spacing.hero",
    "spacing.xl"
  ],
  "--spacing-xl": [
    "spacing.xl"
  ],
  "--spacing-lg": [
    "spacing.lg"
  ],
  "--spacing-md": [
    "spacing.md"
  ],
  "--radius-lg": [
    "radius.lg"
  ]
};

const readPath = (
  source: any,
  path: string
) =>
  path.split(".").reduce(
    (value, segment) =>
      value?.[segment],
    source
  );

const resolveAlias = (
  tokenName: string,
  tokens: any
) => {
  const paths =
    TOKEN_ALIASES[tokenName] || [];

  for (const path of paths) {
    const value =
      readPath(
        tokens,
        path
      );

    if (
      value !== undefined &&
      value !== null
    ) {
      return typeof value === "object"
        ? value.fontSize || value.value
        : value;
    }
  }

  return undefined;
};

export const resolveRuntimeDesignToken = (
  value: unknown,
  tokens: any
) => {
  if (
    typeof value !== "string"
  ) {
    return value;
  }

  const match =
    value.match(CSS_VAR_PATTERN);

  if (!match) {
    return value;
  }

  const [, tokenName, fallback] =
    match;

  if (fallback?.trim()) {
    const fallbackResolved =
      fallback.trim();

    console.log(
      "RUNTIME_TOKEN_RESOLVE",
      {
        value,
        tokenName,
        fallback,
        resolved:
          fallbackResolved,
        source:
          "fallback"
      }
    );

    return fallbackResolved;
  }

  const resolved =
    resolveAlias(
      tokenName,
      tokens
    );

  if (
    resolved !== undefined &&
    resolved !== null
  ) {
    console.log(
      "RUNTIME_TOKEN_RESOLVE",
      {
        value,
        tokenName,
        fallback,
        resolved,
        source:
          "runtimeTokens"
      }
    );

    return resolved;
  }

  console.log(
    "RUNTIME_TOKEN_RESOLVE",
    {
      value,
      tokenName,
      fallback,
      resolved:
        value,
      source:
        "unresolved"
    }
  );

  return value;
};

export const resolveRuntimeDesignTokens = <
  T extends Record<string, any>
>(
  style: T,
  tokens: any
): T => {
  if (
    !style ||
    !tokens
  ) {
    return style;
  }

  return Object.fromEntries(
    Object.entries(style).map(
      ([key, value]) => [
        key,
        resolveRuntimeDesignToken(
          value,
          tokens
        )
      ]
    )
  ) as T;
};
