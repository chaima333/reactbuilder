import type {
  Block
} from "../../../../types/page.types";

export type VisitorAuthPresentation = {
  cardBackground?: string;
  pageBackground?: string;
  titleColor?: string;
  subtitleColor?: string;
  labelColor?: string;
  inputBackground?: string;
  inputTextColor?: string;
  inputBorderColor?: string;
  inputBorderRadius?: string;
  buttonBackground?: string;
  buttonGradient?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  linkColor?: string;
  width?: string;
  padding?: string;
  gap?: string;
  typography?: {
    headingFontFamily?: string;
    titleFontSize?: string;
    titleFontWeight?: string;
    subtitleFontSize?: string;
    labelFontSize?: string;
    labelLetterSpacing?: string;
    labelTextTransform?: string;
    inputFontSize?: string;
    buttonFontSize?: string;
    buttonFontWeight?: string;
    buttonLetterSpacing?: string;
    buttonTextTransform?: string;
  };
  extraVars?: Record<string, string>;
};

const STYLE_TO_PRESENTATION: Array<[
  string,
  keyof Omit<VisitorAuthPresentation, "typography" | "extraVars">
]> = [
  ["--visitor-auth-card-bg", "cardBackground"],
  ["backgroundColor", "pageBackground"],
  ["--visitor-auth-title-color", "titleColor"],
  ["--visitor-auth-subtitle-color", "subtitleColor"],
  ["--visitor-auth-label-color", "labelColor"],
  ["--visitor-auth-input-bg", "inputBackground"],
  ["--visitor-auth-input-color", "inputTextColor"],
  ["--visitor-auth-input-border", "inputBorderColor"],
  ["--visitor-auth-input-radius", "inputBorderRadius"],
  ["--visitor-auth-button-bg", "buttonBackground"],
  ["--visitor-auth-button-color", "buttonTextColor"],
  ["--visitor-auth-button-radius", "buttonBorderRadius"],
  ["--visitor-auth-link-color", "linkColor"],
  ["maxWidth", "width"],
  ["--visitor-auth-card-padding", "padding"],
  ["--visitor-auth-field-gap", "gap"]
];

const TYPOGRAPHY_STYLE_TO_PRESENTATION: Array<[
  string,
  keyof NonNullable<VisitorAuthPresentation["typography"]>
]> = [
  ["--visitor-auth-heading-font-family", "headingFontFamily"],
  ["--visitor-auth-title-font-size", "titleFontSize"],
  ["--visitor-auth-title-font-weight", "titleFontWeight"],
  ["--visitor-auth-subtitle-font-size", "subtitleFontSize"],
  ["--visitor-auth-label-font-size", "labelFontSize"],
  ["--visitor-auth-label-letter-spacing", "labelLetterSpacing"],
  ["--visitor-auth-label-text-transform", "labelTextTransform"],
  ["--visitor-auth-input-font-size", "inputFontSize"],
  ["--visitor-auth-button-font-size", "buttonFontSize"],
  ["--visitor-auth-button-font-weight", "buttonFontWeight"],
  ["--visitor-auth-button-letter-spacing", "buttonLetterSpacing"],
  ["--visitor-auth-button-text-transform", "buttonTextTransform"]
];

const PRESENTATION_TO_STYLE: Array<[
  keyof Omit<VisitorAuthPresentation, "typography" | "extraVars">,
  string
]> = STYLE_TO_PRESENTATION.map(
  ([styleKey, presentationKey]) => [
    presentationKey,
    styleKey
  ]
);

const TYPOGRAPHY_PRESENTATION_TO_STYLE: Array<[
  keyof NonNullable<VisitorAuthPresentation["typography"]>,
  string
]> = TYPOGRAPHY_STYLE_TO_PRESENTATION.map(
  ([styleKey, presentationKey]) => [
    presentationKey,
    styleKey
  ]
);

const isUsableValue = (
  value: unknown
): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value !== "normal" &&
  value !== "none" &&
  value !== "rgba(0, 0, 0, 0)";

const getDesktopStyle = (
  block: Partial<Block> | null | undefined
) => {
  const style =
    block?.data?.style as any;

  return (
    style?.desktop ||
    style ||
    {}
  ) as Record<string, unknown>;
};

export const visitorAuthPresentationToStyle = (
  presentation: VisitorAuthPresentation
) => {
  const style:
    Record<string, string> = {};

  for (const [
    presentationKey,
    styleKey
  ] of PRESENTATION_TO_STYLE) {
    const value =
      presentation[presentationKey];

    if (isUsableValue(value)) {
      style[styleKey] =
        value;
    }
  }

  if (
    isUsableValue(
      presentation.buttonGradient
    )
  ) {
    style["--visitor-auth-button-bg"] =
      presentation.buttonGradient;
  }

  for (const [
    presentationKey,
    styleKey
  ] of TYPOGRAPHY_PRESENTATION_TO_STYLE) {
    const value =
      presentation.typography?.[
        presentationKey
      ];

    if (isUsableValue(value)) {
      style[styleKey] =
        value;
    }
  }

  return {
    ...presentation.extraVars,
    ...style
  };
};

export const extractVisitorAuthPresentation = (
  block: Partial<Block> | null | undefined
): VisitorAuthPresentation | null => {
  if (
    block?.type !== "visitorLogin" &&
    block?.type !== "visitorRegister"
  ) {
    return null;
  }

  const desktop =
    getDesktopStyle(block);

  const presentation:
    VisitorAuthPresentation = {
      typography: {},
      extraVars: {}
    };

  for (const [
    styleKey,
    presentationKey
  ] of STYLE_TO_PRESENTATION) {
    const value =
      desktop[styleKey];

    if (isUsableValue(value)) {
      (presentation as any)[presentationKey] =
        value;
    }
  }

  for (const [
    styleKey,
    presentationKey
  ] of TYPOGRAPHY_STYLE_TO_PRESENTATION) {
    const value =
      desktop[styleKey];

    if (isUsableValue(value)) {
      presentation.typography![
        presentationKey
      ] = value;
    }
  }

  for (const [
    key,
    value
  ] of Object.entries(desktop)) {
    if (
      key.startsWith("--visitor-auth-") &&
      isUsableValue(value) &&
      !STYLE_TO_PRESENTATION.some(
        ([styleKey]) => styleKey === key
      ) &&
      !TYPOGRAPHY_STYLE_TO_PRESENTATION.some(
        ([styleKey]) => styleKey === key
      )
    ) {
      presentation.extraVars![key] =
        value;
    }
  }

  const hasTypography =
    Object.keys(
      presentation.typography || {}
    ).length > 0;

  const hasExtraVars =
    Object.keys(
      presentation.extraVars || {}
    ).length > 0;

  if (!hasTypography) {
    delete presentation.typography;
  }

  if (!hasExtraVars) {
    delete presentation.extraVars;
  }

  const hasPresentation =
    Object.keys(
      presentation
    ).length > 0;

  return hasPresentation
    ? presentation
    : null;
};

export const applyVisitorAuthPresentationToBlock = (
  block: Block,
  presentation: VisitorAuthPresentation,
  props?: Record<string, unknown>
): Block => {
  const style =
    (block.data?.style || {}) as any;

  return {
    ...block,
    data: {
      ...block.data,
      props: {
        ...(block.data?.props || {}),
        ...(props || {})
      },
      style: {
        ...style,
        desktop: {
          ...(style.desktop || {}),
          ...visitorAuthPresentationToStyle(
            presentation
          )
        },
        tablet: {
          ...(style.tablet || {})
        },
        mobile: {
          ...(style.mobile || {})
        }
      }
    }
  };
};

export const findFirstVisitorAuthBlock = (
  blocks: Block[] = [],
  type: "visitorLogin" | "visitorRegister"
): Block | null => {
  for (const block of blocks) {
    if (block?.type === type) {
      return block;
    }

    const found =
      findFirstVisitorAuthBlock(
        block.children || [],
        type
      );

    if (found) {
      return found;
    }
  }

  return null;
};

export const updateFirstVisitorAuthBlock = (
  blocks: Block[] = [],
  type: "visitorLogin" | "visitorRegister",
  update: (block: Block) => Block
): {
  blocks: Block[];
  updated: boolean;
} => {
  let updated = false;

  const nextBlocks =
    blocks.map((block): Block => {
      if (
        !updated &&
        block?.type === type
      ) {
        updated = true;
        return update(block);
      }

      const nextChildren =
        updateFirstVisitorAuthBlock(
          block.children || [],
          type,
          update
        );

      if (nextChildren.updated) {
        updated = true;
        return {
          ...block,
          children:
            nextChildren.blocks
        };
      }

      return block;
    });

  return {
    blocks: nextBlocks,
    updated
  };
};
