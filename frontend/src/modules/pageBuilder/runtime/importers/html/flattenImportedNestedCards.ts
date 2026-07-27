import type {
  SerializedBlock
} from "./semanticMatchers";

type StyleMap = Record<string, any>;

const PARENT_CARD_TYPES = new Set([
  "gridItem",
  "flexItem",
]);

const CHILD_WRAPPER_TYPES = new Set([
  "gridItem",
  "flexItem",
  "flex"
]);

const FLOW_PRIMITIVE_TYPES = new Set([
  "title",
  "text",
  "link"
]);

const STRUCTURAL_KEYS = [
  "display",
  "flexDirection",
  "flexWrap",
  "alignItems",
  "alignContent",
  "justifyContent",
  "justifyItems",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridAutoColumns",
  "gridAutoRows",
  "gridAutoFlow",
  "gap",
  "rowGap",
  "columnGap"
] as const;

const INHERITED_KEYS = [
  "color",
  "fontFamily",
  "textAlign"
] as const;

const SHELL_KEYS = [
  "background",
  "backgroundColor",
  "border",
  "borderRadius",
  "boxShadow",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft"
] as const;

const MARGIN_KEYS = [
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft"
] as const;

const toResponsiveStyle = (
  input: StyleMap = {}
) => {
  const hasBreakpoints =
    "desktop" in input ||
    "tablet" in input ||
    "mobile" in input;

  if (hasBreakpoints) {
    return {
      ...input,
      desktop: { ...(input.desktop || {}) },
      tablet: { ...(input.tablet || {}) },
      mobile: { ...(input.mobile || {}) }
    };
  }

  return {
    desktop: { ...input },
    tablet: {},
    mobile: {}
  };
};

const normalizeCssValue = (
  value: unknown
) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const normalizeColor = (
  value: unknown
) => {
  const normalized = normalizeCssValue(value);

  if (normalized === "white") {
    return "255,255,255,1";
  }

  const shortHex = normalized.match(/^#([0-9a-f]{3})$/i);
  if (shortHex) {
    const channels = shortHex[1]
      .split("")
      .map((part) => parseInt(part + part, 16));
    return `${channels.join(",")},1`;
  }

  const hex = normalized.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return `${[
      parseInt(hex[1].slice(0, 2), 16),
      parseInt(hex[1].slice(2, 4), 16),
      parseInt(hex[1].slice(4, 6), 16)
    ].join(",")},1`;
  }

  const rgb = normalized.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/
  );

  return rgb
    ? `${Number(rgb[1])},${Number(rgb[2])},${Number(rgb[3])},${rgb[4] === undefined ? 1 : Number(rgb[4])}`
    : normalized;
};

const isVisibleValue = (
  value: unknown
) => {
  const normalized = normalizeCssValue(value);

  return !!normalized &&
    normalized !== "none" &&
    normalized !== "transparent" &&
    normalized !== "0" &&
    normalized !== "0px" &&
    normalized !== "rgba(0, 0, 0, 0)";
};

const getDesktopStyle = (
  block: SerializedBlock
) => {
  const style = block.data?.style || {};

  return (
    "desktop" in style ||
    "tablet" in style ||
    "mobile" in style
  )
    ? style.desktop || {}
    : style;
};

const getBackground = (
  style: StyleMap
) =>
  style.backgroundColor || style.background;

const getShellSignals = (
  style: StyleMap
) => ({
  background: isVisibleValue(getBackground(style))
    ? getBackground(style)
    : undefined,
  border: isVisibleValue(style.border)
    ? style.border
    : undefined,
  borderRadius: isVisibleValue(style.borderRadius)
    ? style.borderRadius
    : undefined,
  boxShadow: isVisibleValue(style.boxShadow)
    ? style.boxShadow
    : undefined,
  padding: isVisibleValue(style.padding)
    ? style.padding
    : undefined
});

const isCardLike = (
  block: SerializedBlock
) => {
  const signals = getShellSignals(
    getDesktopStyle(block)
  );
  const visibleSignals = Object.values(signals)
    .filter(Boolean).length;

  return !!signals.background && visibleSignals >= 2 ||
    visibleSignals >= 3;
};

const hasEquivalentShell = (
  parent: SerializedBlock,
  child: SerializedBlock
) => {
  const parentSignals = getShellSignals(
    getDesktopStyle(parent)
  );
  const childSignals = getShellSignals(
    getDesktopStyle(child)
  );

  let matches = 0;

  if (
    parentSignals.background &&
    childSignals.background &&
    normalizeColor(parentSignals.background) ===
      normalizeColor(childSignals.background)
  ) {
    matches += 1;
  }

  ([
    "border",
    "borderRadius",
    "boxShadow",
    "padding"
  ] as const).forEach((key) => {
    if (
      parentSignals[key] &&
      childSignals[key] &&
      normalizeCssValue(parentSignals[key]) ===
        normalizeCssValue(childSignals[key])
    ) {
      matches += 1;
    }
  });

  return matches >= 2;
};

const hasSemanticMeaning = (
  block: SerializedBlock
) => {
  const meta = (block as any).meta || {};
  const props = block.data?.props || {};

  return !!meta.semanticType ||
    !!props.semanticRole ||
    !!props.semantic ||
    Object.keys(props).length > 0;
};

const isImported = (
  block: SerializedBlock
) =>
  (block as any)?.meta?.importSource === "html";

const mergeBreakpoint = (
  parent: StyleMap,
  child: StyleMap
) => {
  const merged = { ...parent };

  STRUCTURAL_KEYS.forEach((key) => {
    if (child[key] !== undefined) {
      merged[key] = child[key];
    }
  });

  [...INHERITED_KEYS, ...SHELL_KEYS].forEach((key) => {
    if (merged[key] === undefined && child[key] !== undefined) {
      merged[key] = child[key];
    }
  });

  return merged;
};

const mergeWrapperStyle = (
  parent: StyleMap,
  child: StyleMap
) => {
  const parentResponsive = toResponsiveStyle(parent);
  const childResponsive = toResponsiveStyle(child);

  return {
    ...parentResponsive,
    desktop: mergeBreakpoint(
      parentResponsive.desktop,
      childResponsive.desktop
    ),
    tablet: mergeBreakpoint(
      parentResponsive.tablet,
      childResponsive.tablet
    ),
    mobile: mergeBreakpoint(
      parentResponsive.mobile,
      childResponsive.mobile
    )
  };
};

const canFlatten = (
  parent: SerializedBlock,
  child: SerializedBlock
) =>
  isImported(parent) &&
  isImported(child) &&
  PARENT_CARD_TYPES.has(parent.type) &&
  CHILD_WRAPPER_TYPES.has(child.type) &&
  !hasSemanticMeaning(parent) &&
  !hasSemanticMeaning(child) &&
  isCardLike(parent) &&
  isCardLike(child) &&
  hasEquivalentShell(parent, child);

const normalizePrimitiveWrapper = (
  block: SerializedBlock
): SerializedBlock => {
  const child = block.children?.[0];

  if (
    !child ||
    block.children?.length !== 1 ||
    !isImported(block) ||
    !isImported(child) ||
    !PARENT_CARD_TYPES.has(block.type) ||
    !FLOW_PRIMITIVE_TYPES.has(child.type) ||
    hasSemanticMeaning(block)
  ) {
    return block;
  }

  const parentStyle = toResponsiveStyle(
    block.data?.style || {}
  );
  const childStyle = toResponsiveStyle(
    child.data?.style || {}
  );
  const duplicatedShell = hasEquivalentShell(
    block,
    child
  );

  (["desktop", "tablet", "mobile"] as const).forEach(
    (breakpoint) => {
      delete parentStyle[breakpoint].height;
      delete parentStyle[breakpoint].minHeight;
      delete parentStyle[breakpoint].maxHeight;

      delete childStyle[breakpoint].height;
      delete childStyle[breakpoint].minHeight;
      delete childStyle[breakpoint].maxHeight;

      MARGIN_KEYS.forEach(
        (key) => delete childStyle[breakpoint][key]
      );

      if (duplicatedShell) {
        SHELL_KEYS.forEach(
          (key) => delete parentStyle[breakpoint][key]
        );
      }
    }
  );

  return {
    ...block,
    data: {
      ...(block.data || {}),
      props: {
        ...(block.data?.props || {})
      },
      style: parentStyle
    },
    children: [
      {
        ...child,
        data: {
          ...(child.data || {}),
          props: {
            ...(child.data?.props || {})
          },
          style: childStyle
        }
      }
    ]
  } as SerializedBlock;
};

const flattenBlock = (
  block: SerializedBlock
): SerializedBlock => {
  let next: SerializedBlock = {
    ...block,
    data: {
      ...(block.data || {}),
      props: {
        ...(block.data?.props || {})
      },
      style: {
        ...(block.data?.style || {})
      }
    },
    children: (block.children || []).map(flattenBlock)
  };

  while (
    next.children?.length === 1 &&
    canFlatten(next, next.children[0])
  ) {
    const wrapper = next.children[0];

    next = {
      ...next,
      meta: {
        ...((next as any).meta || {}),
        flattenedImportedWrappers:
          Number(
            (next as any)?.meta?.flattenedImportedWrappers || 0
          ) + 1
      },
      data: {
        ...(next.data || {}),
        props: {
          ...(next.data?.props || {})
        },
        style: mergeWrapperStyle(
          next.data?.style || {},
          wrapper.data?.style || {}
        )
      },
      children: wrapper.children || []
    } as SerializedBlock;
  }

  return normalizePrimitiveWrapper(next);
};

export const flattenImportedNestedCards = (
  blocks: SerializedBlock[]
): SerializedBlock[] =>
  (blocks || []).map(flattenBlock);
