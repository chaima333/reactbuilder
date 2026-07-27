import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../../../css/extractStyleProps";

const textOf = (
  element?: HTMLElement | null
) =>
  (element?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();

const getWindow = (
  element: HTMLElement
) =>
  element.ownerDocument.defaultView ||
  window;

const getComputed = (
  element: HTMLElement
) =>
  getWindow(
    element
  ).getComputedStyle(
    element
  );

const cleanCenteredDesktopStyle = (
  source: HTMLElement
) => {
  const extracted =
    extractLayoutStyles(
      source
    );

  const desktop =
    {
      ...(extracted.desktop || {})
    };

  delete desktop.margin;
  delete desktop.marginLeft;
  delete desktop.marginRight;

  return {
    extracted,
    desktop
  };
};

const createTextBlock = (
  element: HTMLElement
) => ({
  id:
    crypto.randomUUID(),

  type:
    "text",

  data: {
    props: {
      content:
        textOf(
          element
        )
    },

    style:
      extractTypographyStyles(
        element
      )
  },

  children: []
});

const createActionBlock = (
  element: HTMLElement
) => {
  const layout =
    extractLayoutStyles(
      element
    );

  const typography =
    extractTypographyStyles(
      element
    );

  const tagName =
    element.tagName.toLowerCase();

  return {
    id:
      crypto.randomUUID(),

    type:
      tagName === "button"
        ? "button"
        : "link",

    data: {
      props:
        tagName === "button"
          ? {
              label:
                textOf(
                  element
                )
            }
          : {
              label:
                textOf(
                  element
                ),

              href:
                element.getAttribute(
                  "href"
                ) || "#"
            },

      style: {
        ...layout,

        desktop: {
          ...(layout.desktop || {}),
          ...(typography.desktop || {})
        },

        tablet: {
          ...(layout.tablet || {}),
          ...(typography.tablet || {})
        },

        mobile: {
          ...(layout.mobile || {}),
          ...(typography.mobile || {})
        }
      }
    },

    children: []
  };
};

const getDirectHTMLElementChildren = (
  element: HTMLElement
) =>
  Array.from(
    element.children
  ).filter(
    (
      child
    ): child is HTMLElement =>
      child instanceof
      getWindow(
        element
      ).HTMLElement
  );

const getDirectAction = (
  source: HTMLElement
) =>
  getDirectHTMLElementChildren(
    source
  ).find(
    child =>
      [
        "a",
        "button"
      ].includes(
        child.tagName.toLowerCase()
      )
  ) || null;

const getDirectContentElement = (
  source: HTMLElement,
  action: HTMLElement | null
) =>
  getDirectHTMLElementChildren(
    source
  ).find(
    child =>
      child !== action
  ) || null;

const buildTextChildrenFromElement = (
  element: HTMLElement | null
) => {
  if (!element) {
    return [];
  }

  const directChildren =
    getDirectHTMLElementChildren(
      element
    );

  if (
    directChildren.length
  ) {
    return directChildren
      .filter(
        child =>
          textOf(
            child
          )
      )
      .map(
        createTextBlock
      );
  }

  return textOf(
    element
  )
    ? [
        createTextBlock(
          element
        )
      ]
    : [];
};
const parsePixelValue = (
  value?: string | null
) => {
  if (
    !value ||
    !/^-?\d+(?:\.\d+)?px$/i.test(
      value.trim()
    )
  ) {
    return null;
  }

  const parsed =
    Number.parseFloat(
      value
    );

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

const isUsableMaxWidth = (
  value?: string | null
) =>
  !!value &&
  value !== "none" &&
  value !== "100%" &&
  value !== "auto";

const getNearestContainerConstraint = (
  source: HTMLElement
) => {
  let current =
    source.parentElement;

  const viewportWidth =
    source.ownerDocument.documentElement
      .clientWidth ||
    getWindow(source).innerWidth ||
    0;

  while (
    current &&
    current.tagName.toLowerCase() !== "body"
  ) {
    const computed =
      getComputed(
        current
      );

    const layout =
      extractLayoutStyles(
        current
      );

    const desktop =
      layout.desktop || {};

    const computedWidth =
      parsePixelValue(
        computed.width
      );

    const isConstrainedWidth =
      computedWidth !== null &&
      computedWidth > 0 &&
      viewportWidth > 0 &&
      computedWidth <
        viewportWidth - 2;

    const isCentered =
      computed.marginLeft === "auto" ||
      computed.marginRight === "auto" ||
      (
        parsePixelValue(
          computed.marginLeft
        ) !== null &&
        parsePixelValue(
          computed.marginLeft
        ) ===
          parsePixelValue(
            computed.marginRight
          ) &&
        Number(
          parsePixelValue(
            computed.marginLeft
          )
        ) > 0
      );

    const horizontalPadding =
      (
        parsePixelValue(
          computed.paddingLeft
        ) || 0
      ) +
      (
        parsePixelValue(
          computed.paddingRight
        ) || 0
      );

    if (
      isConstrainedWidth &&
      isCentered
    ) {
      return {
        maxWidth:
          `${Math.max(
            0,
            computedWidth -
              horizontalPadding
          )}px`
      };
    }

    if (
      isUsableMaxWidth(
        computed.maxWidth
      )
    ) {
      return {
        maxWidth:
          computed.maxWidth
      };
    }

    if (
      isUsableMaxWidth(
        desktop.maxWidth
      )
    ) {
      return {
        maxWidth:
          desktop.maxWidth
      };
    }

    current =
      current.parentElement;
  }

  return {
    maxWidth: "100%"
  };
};
const emitMarketsLikeSection = (
  payload: any
) => {
  const source =
    payload?.claimedNode?.element as
      | HTMLElement
      | undefined;

  if (!source) {
    return null;
  }

  const {
    extracted,
    desktop
  } =
    cleanCenteredDesktopStyle(
      source
    );

  const computed =
    getComputed(
      source
    );

  const action =
    getDirectAction(
      source
    );

  const contentElement =
    getDirectContentElement(
      source,
      action
    );

  const contentChildren =
    buildTextChildrenFromElement(
      contentElement
    );
  const parentConstraint =
    getNearestContainerConstraint(
      source
    );

  const sourceMaxWidth =
    parentConstraint.maxWidth !== "100%"
      ? parentConstraint.maxWidth
      : isUsableMaxWidth(
          desktop.maxWidth
        )
        ? desktop.maxWidth
        : "100%";

  return {
    id:
      `service-section-${crypto.randomUUID()}`,

    type:
      "section",

    meta: {
      semanticType:
        "SERVICE_PAGE_SECTION",

      semanticVariant:
        payload?.variant
    },

    data: {
      props: {},

      style: {
        desktop: {
          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box",

          overflow:
            "visible"
        },

        tablet: {
          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box"
        },

        mobile: {
          width:
            "100%",

          maxWidth:
            "100%",

          boxSizing:
            "border-box"
        }
      }
    },

    children: [
      {
        id:
          `service-section-inner-${crypto.randomUUID()}`,

        type:
          "flex",

        data: {
          props: {},

          style: {
            ...extracted,

            desktop: {
              ...desktop,

              display:
                computed.display || "flex",

              flexDirection:
                computed.flexDirection || "row",

              justifyContent:
                computed.justifyContent ||
                "space-between",

              alignItems:
                computed.alignItems ||
                "center",

              flexWrap:
                computed.flexWrap ||
                "wrap",

              gap:
                computed.gap ||
                desktop.gap,

              width:
                "100%",

              maxWidth:
                sourceMaxWidth,

              marginLeft:
                "auto",

              marginRight:
                "auto",

              minWidth:
                "0",

              boxSizing:
                "border-box",

              overflow:
                "visible"
            },

            tablet: {
              ...(extracted.tablet || {}),

              display:
                "flex",

              flexDirection:
                computed.flexDirection ||
                "row",

              justifyContent:
                computed.justifyContent ||
                "space-between",

              alignItems:
                computed.alignItems ||
                "center",

              flexWrap:
                "wrap",

              gap:
                computed.gap ||
                desktop.gap,

              width:
                "100%",

              maxWidth:
                "100%",

              minWidth:
                "0",

              boxSizing:
                "border-box"
            },

            mobile: {
              ...(extracted.mobile || {}),

              display:
                "flex",

              flexDirection:
                "column",

              width:
                "100%",

              maxWidth:
                "100%",

              minWidth:
                "0",

              boxSizing:
                "border-box"
            }
          }
        },

        children: [
          {
            id:
              `service-section-content-${crypto.randomUUID()}`,

            type:
              "flexItem",

            data: {
              props: {},

              style: {
                desktop: {
                  flex:
                    "1 1 0",

                  minWidth:
                    "0",

                  boxSizing:
                    "border-box"
                },

                tablet: {
                  flex:
                    "1 1 320px",

                  minWidth:
                    "0"
                },

                mobile: {
                  width:
                    "100%"
                }
              }
            },

            children:
              contentChildren
          },

          ...(action
            ? [
                {
                  id:
                    `service-section-action-${crypto.randomUUID()}`,

                  type:
                    "flexItem",

                  data: {
                    props: {},

                    style: {
                      desktop: {
                        flex:
                          "0 0 auto",

                        marginLeft:
                          "auto",

                        boxSizing:
                          "border-box"
                      },

                      tablet: {
                        flex:
                          "0 0 auto",

                        marginLeft:
                          "auto"
                      },

                      mobile: {
                        width:
                          "100%",

                        marginLeft:
                          "0"
                      }
                    }
                  },

                  children: [
                    createActionBlock(
                      action
                    )
                  ]
                }
              ]
            : [])
        ]
      }
    ]
  };
};

export const emitServicePageSectionBlock = (
  payload: any
) => {
  if (
    payload?.variant ===
    "SERVICE_MARKETS"
  ) {
    return emitMarketsLikeSection(
      payload
    );
  }

  return null;
};
