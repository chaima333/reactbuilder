import type {
  SerializedBlock
} from "./semanticMatchers";

type StyleMap = Record<string, any>;

const LAYOUT_TYPES = new Set([
  "section",
  "flex",
  "flexItem",
  "grid",
  "gridItem"
]);

const INTRINSIC_TEXT_TYPES = new Set([
  "title",
  "text",
  "link"
]);

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
      desktop: {
        ...(input.desktop || {})
      },
      tablet: {
        ...(input.tablet || {})
      },
      mobile: {
        ...(input.mobile || {})
      }
    };
  }

  return {
    desktop: {
      ...input
    },
    tablet: {},
    mobile: {}
  };
};

const countTopLevelGridTracks = (
  template: string
) => {
  let depth = 0;
  let tracks = 0;
  let insideTrack = false;

  for (const character of template.trim()) {
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth = Math.max(0, depth - 1);
    }

    const separator =
      depth === 0 && /\s/.test(character);

    if (separator) {
      if (insideTrack) {
        tracks += 1;
        insideTrack = false;
      }
    } else {
      insideTrack = true;
    }
  }

  return tracks + (insideTrack ? 1 : 0);
};

const hasMultipleGridColumns = (
  template: unknown,
  childCount: number
) => {
  if (typeof template !== "string" || !template.trim()) {
    return childCount > 1;
  }

  const normalized = template.trim().toLowerCase();
  const repeat = normalized.match(
    /^repeat\(\s*(\d+|auto-fit|auto-fill)\s*,/
  );

  if (repeat) {
    return repeat[1] === "auto-fit" ||
      repeat[1] === "auto-fill" ||
      Number(repeat[1]) > 1;
  }

  return countTopLevelGridTracks(normalized) > 1;
};

const applyWidthDefaults = (
  style: ReturnType<typeof toResponsiveStyle>
) => {
  style.tablet = {
    ...style.tablet,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box"
  };

  style.mobile = {
    ...style.mobile,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box"
  };
};
const VISIBLE_CONTENT_TYPES = new Set([
  "title",
  "text",
  "link",
  "button",
  "image"
]);

const capPixelValue = (
  value: unknown,
  maximum: number
) => {
  const numeric =
    Number.parseFloat(
      String(value || "")
    );

  if (!Number.isFinite(numeric)) {
    return value;
  }

  return `${Math.min(numeric, maximum)}px`;
};
const applyResponsiveStyle = (
  block: SerializedBlock
) => {
  const type = String(block.type || "");
 const style = toResponsiveStyle(
  block.data?.style ||
  (block as any).style ||
  {}
);
  const desktop = style.desktop;

if (VISIBLE_CONTENT_TYPES.has(type)) {
  (
    [
      "desktop",
      "tablet",
      "mobile"
    ] as const
  ).forEach((breakpoint) => {
    const current =
      style[breakpoint];

    if (
      current.opacity === 0 ||
      String(
        current.opacity || ""
      ).trim() === "0"
    ) {
      current.opacity = 1;
    }

    if (
      current.visibility === "hidden"
    ) {
      current.visibility = "visible";
    }

    delete current.transform;
    delete current.translate;
  });
}

  if (INTRINSIC_TEXT_TYPES.has(type)) {
    (["desktop", "tablet", "mobile"] as const).forEach(
      (breakpoint) => {
        delete style[breakpoint].height;
        delete style[breakpoint].minHeight;
        delete style[breakpoint].maxHeight;
      }
    );
  }

  if (LAYOUT_TYPES.has(type)) {
    applyWidthDefaults(style);
  }

if (
  type === "section" ||
  type === "flex" ||
  type === "grid"
) {
  style.tablet = {
    ...style.tablet,
    height: "auto",
    minHeight: 0,
    maxHeight: "none"
  };

  style.mobile = {
    ...style.mobile,
    height: "auto",
    minHeight: 0,
    maxHeight: "none"
  };
}
  if (type === "grid") {
    const desktopTemplate =
      desktop.gridTemplateColumns;
    const multipleColumns = hasMultipleGridColumns(
      desktopTemplate,
      block.children?.length || 0
    );
    const hasFixedPixelColumns =
      typeof desktopTemplate === "string" &&
      /\d+(?:\.\d+)?px\b/i.test(desktopTemplate);

    if (multipleColumns) {
      style.tablet.gridTemplateColumns =
        "repeat(2, minmax(0, 1fr))";
      style.mobile.gridTemplateColumns =
        "minmax(0, 1fr)";
    } else if (hasFixedPixelColumns) {
      style.tablet.gridTemplateColumns =
        "minmax(0, 1fr)";
      style.mobile.gridTemplateColumns =
        "minmax(0, 1fr)";
    }

    style.tablet.overflowX = "hidden";
    style.mobile.overflowX = "hidden";
  }

  if (
    type === "flex" &&
    (
      !desktop.flexDirection ||
      desktop.flexDirection === "row" ||
      desktop.flexDirection === "row-reverse"
    )
  ) {
    style.tablet.flexWrap = "wrap";
    style.mobile.flexDirection = "column";
    style.mobile.flexWrap = "wrap";
  }

  if (type === "image") {
    style.tablet.maxWidth = "100%";
    style.tablet.height = "auto";
    style.mobile.maxWidth = "100%";
    style.mobile.height = "auto";
  }
/*
 * Imported desktop typography must not
 * remain oversized on smaller screens.
 */
if (type === "title") {
  const desktopFontSize =
    Number.parseFloat(
      String(
        desktop.fontSize || ""
      )
    );

  if (
    Number.isFinite(
      desktopFontSize
    ) &&
    desktopFontSize > 72
  ) {
    style.tablet.fontSize =
      "clamp(42px, 7vw, 72px)";

    style.tablet.lineHeight =
      "1.08";

    style.mobile.fontSize =
      "clamp(32px, 11vw, 52px)";

    style.mobile.lineHeight =
      "1.08";

    style.mobile.letterSpacing =
      "-1px";
  }
}
if (type === "section") {
  style.tablet.paddingTop =
    capPixelValue(
      style.tablet.paddingTop ??
        desktop.paddingTop,
      96
    );

  style.tablet.paddingBottom =
    capPixelValue(
      style.tablet.paddingBottom ??
        desktop.paddingBottom,
      80
    );

  style.mobile.paddingTop =
    capPixelValue(
      style.mobile.paddingTop ??
        desktop.paddingTop,
      72
    );

  style.mobile.paddingBottom =
    capPixelValue(
      style.mobile.paddingBottom ??
        desktop.paddingBottom,
      56
    );
}
  return style;
};

const transformImportedBlock = (
  block: SerializedBlock
): SerializedBlock => {
  const normalizedStyle =
    applyResponsiveStyle(block);

  const normalizedProps = {
    ...(
      block.data?.props ||
      (block as any).props ||
      {}
    )
  };

  return {
    ...block,

    meta: {
      ...((block as any).meta || {}),
      importSource: "html"
    },

    /*
     * Keep legacy top-level values synchronized.
     */
    props: normalizedProps,
    style: normalizedStyle,

    data: {
      ...(block.data || {}),
      props: normalizedProps,
      style: normalizedStyle
    },

    children: (block.children || []).map(
      transformImportedBlock
    )
  } as SerializedBlock;
};
export const applyImportedResponsiveDefaults = (
  blocks: SerializedBlock[]
): SerializedBlock[] =>
  (blocks || []).map(
    transformImportedBlock
  );
