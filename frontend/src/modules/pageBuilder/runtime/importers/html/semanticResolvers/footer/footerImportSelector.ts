import type {
  Block
} from "../../../../../types/page.types";

const createId = (
  prefix: string
) =>
  `${prefix}-${
    globalThis.crypto?.randomUUID?.() ||
    Math.random().toString(36).slice(2)
  }`;

const isUsefulCssValue = (
  value: any
) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  value !== "none" &&
  value !== "normal" &&
  value !== "auto";

const pickUsefulValue = (
  ...values: any[]
) =>
  values.find(
    isUsefulCssValue
  );

const cleanStyle = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    Object.entries(style).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "none"
    )
  );

const getDesktopStyle = (
  block?: any
): Record<string, any> =>
  block?.data?.style?.desktop || {};

const getFirstChildDesktopStyle = (
  block?: any
): Record<string, any> =>
  block?.children?.[0]?.data?.style?.desktop || {};

const hasCenteredContainer = (
  block?: any
) => {
  const firstChildStyle =
    getFirstChildDesktopStyle(block);

  const hasRealMaxWidth =
    isUsefulCssValue(
      firstChildStyle.maxWidth
    );

  const hasAutoMargin =
    firstChildStyle.margin === "0 auto" ||
    (
      firstChildStyle.marginLeft === "auto" &&
      firstChildStyle.marginRight === "auto"
    );

  return (
    hasRealMaxWidth &&
    hasAutoMargin
  );
};

export const normalizeFooterLikeNavbar = (
  block: Block | null,
  legacyBlock?: Block | null
): Block | null => {
  if (!block) {
    return null;
  }

  if (hasCenteredContainer(block)) {
    return {
      ...block,
      type: "footer"
    };
  }

  const blockDesktopStyle =
    getDesktopStyle(block);

  const firstChildDesktopStyle =
    getFirstChildDesktopStyle(block);

  const legacyContainerDesktopStyle =
    getFirstChildDesktopStyle(legacyBlock);

  const containerMaxWidth =
    pickUsefulValue(
      firstChildDesktopStyle.maxWidth,
      legacyContainerDesktopStyle.maxWidth,
      "1180px"
    );

  const containerWidth =
    pickUsefulValue(
      firstChildDesktopStyle.width,
      legacyContainerDesktopStyle.width,
      "100%"
    );

  const containerGap =
    pickUsefulValue(
      firstChildDesktopStyle.gap,
      legacyContainerDesktopStyle.gap
    );

  const containerStyle =
    cleanStyle({
      display: "flex",
      flexDirection: "column",

      width:
        containerWidth,

      maxWidth:
        containerMaxWidth,

      margin:
        "0 auto",

      marginLeft:
        "auto",

      marginRight:
        "auto",

      paddingLeft:
        pickUsefulValue(
          firstChildDesktopStyle.paddingLeft,
          legacyContainerDesktopStyle.paddingLeft
        ),

      paddingRight:
        pickUsefulValue(
          firstChildDesktopStyle.paddingRight,
          legacyContainerDesktopStyle.paddingRight
        ),

      gap:
        containerGap,

      boxSizing:
        "border-box"
    });

  return {
    ...block,

    type:
      "footer",

    data: {
      ...(block.data || {}),
      props:
        block.data?.props || {},
      style: {
        ...(block.data?.style || {}),
        desktop: {
          ...blockDesktopStyle,
          width: "100%",
          boxSizing: "border-box"
        }
      }
    },

    children: [
      {
        id:
          createId("footer-container"),

        type:
          "flex",

        data: {
          props: {},
          style: {
            desktop:
              containerStyle,

            tablet: {
              width: "100%",
              boxSizing: "border-box"
            },

            mobile: {
              width: "100%",
              boxSizing: "border-box"
            }
          }
        },

        children:
          block.children || []
      }
    ]
  };
};

export const selectImportedFooterBlock = ({
  genericFooterBlock,
  legacyFooterBlock,
  hasUsefulBlockContent
}: {
  genericFooterBlock: Block | null;
  legacyFooterBlock: Block | null;
  hasUsefulBlockContent: (block: any) => boolean;
}): Block | null => {
  if (
    genericFooterBlock &&
    hasUsefulBlockContent(genericFooterBlock)
  ) {
    return normalizeFooterLikeNavbar(
      genericFooterBlock,
      legacyFooterBlock
    );
  }

  if (
    legacyFooterBlock &&
    hasUsefulBlockContent(legacyFooterBlock)
  ) {
    return normalizeFooterLikeNavbar(
      legacyFooterBlock,
      legacyFooterBlock
    );
  }

  return null;
};