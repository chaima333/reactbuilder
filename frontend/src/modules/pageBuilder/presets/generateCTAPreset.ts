import { v4 as uuidv4 } from "uuid";

import type {
  Block
} from "../types/page.types";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  filterTextStyle,
  mergePresetDesktopStyle
} from "./styleFilters";

// =====================================
// PAYLOAD TYPES
// =====================================

interface CTAPresetPayload {

  title?: string;

  titleSegments?: Array<{
    text: string;
    variant: "default" | "accent";
    sourceClass?: string;
  }>;

  text?: string;

  button?: string;

  actions?: Array<{
    label?: string;
    href?: string;
  }>;

  claimedNode?: {
    element?: HTMLElement;
  };

  sectionElement?: HTMLElement;

  containerElement?: HTMLElement;

  panelElement?: HTMLElement;
}

const desktopOf = (
  style: any
) =>
  style?.desktop || style || {};

const parsePx = (
  value: unknown
) => {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const match =
    value
      .trim()
      .match(/^(\d+(?:\.\d+)?)px$/);

  return match
    ? Number(
        match[1]
      )
    : null;
};

const filterActionRowStyle = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    [
      "display",
      "flexDirection",
      "flexWrap",
      "gap",
      "rowGap",
      "columnGap",
      "justifyContent",
      "alignItems"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== ""
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  );

const filterCtaPanelStyle = (
  style: Record<string, any>
) => {
  const result =
    Object.fromEntries(
    [
      "background",
      "backgroundColor",
      "backgroundImage",
      "color",
      "padding",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "margin",
      "marginTop",
      "marginBottom",
      "marginLeft",
      "marginRight",
      "border",
      "borderRadius",
      "boxShadow",
      "width",
      "maxWidth",
      "display",
      "flexDirection",
      "flexWrap",
      "gap",
      "rowGap",
      "columnGap",
      "alignItems",
      "justifyContent"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== "" &&
          style[key] !== "transparent" &&
          style[key] !== "none" &&
          style[key] !== "normal" &&
          style[key] !== "rgba(0, 0, 0, 0)" &&
          style[key] !== "rgba(0,0,0,0)"
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  );

  if (result.marginLeft === "0px") {
    delete result.marginLeft;
  }

  if (result.marginRight === "0px") {
    delete result.marginRight;
  }

  if (result.display === "block") {
    delete result.display;
  }

  if (result.alignItems === "normal") {
    delete result.alignItems;
  }

  if (result.justifyContent === "normal") {
    delete result.justifyContent;
  }

  return result;
};

const filterCtaSectionStyle = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    [
      "background",
      "backgroundColor",
      "backgroundImage",
      "color",
      "padding",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "display",
      "alignItems",
      "justifyContent"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== "" &&
          style[key] !== "transparent" &&
          style[key] !== "none" &&
          style[key] !== "normal" &&
          style[key] !== "rgba(0, 0, 0, 0)" &&
          style[key] !== "rgba(0,0,0,0)"
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  );

const filterCtaContainerStyle = (
  style: Record<string, any>
) => {
  const result =
    Object.fromEntries(
    [
      "width",
      "maxWidth",
      "margin",
      "marginLeft",
      "marginRight",
      "padding",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "display",
      "flexDirection",
      "alignItems",
      "justifyContent"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== "" &&
          style[key] !== "none" &&
          style[key] !== "normal"
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  );

  if (result.marginLeft === "0px") {
    delete result.marginLeft;
  }

  if (result.marginRight === "0px") {
    delete result.marginRight;
  }

  if (result.margin === "0px") {
    delete result.margin;
  }

  if (result.display === "block") {
    delete result.display;
  }

  return result;
};

const filterCtaButtonStyle = (
  style: Record<string, any>
) =>
  Object.fromEntries(
    [
      "background",
      "backgroundColor",
      "backgroundImage",
      "color",
      "border",
      "borderRadius",
      "boxShadow",
      "padding",
      "paddingTop",
      "paddingBottom",
      "paddingLeft",
      "paddingRight",
      "fontSize",
      "fontWeight",
      "lineHeight",
      "textAlign",
      "minWidth",
      "width",
      "maxWidth"
    ]
      .filter(
        key =>
          style[key] !== undefined &&
          style[key] !== "" &&
          style[key] !== "transparent" &&
          style[key] !== "none" &&
          style[key] !== "normal" &&
          style[key] !== "rgba(0, 0, 0, 0)" &&
          style[key] !== "rgba(0,0,0,0)"
      )
      .map(
        key => [
          key,
          style[key]
        ]
      )
  );

const getComputedCtaPanelStyle = (
  element: HTMLElement
) => {
  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      element
    );

  return {
    desktop: {
      background:
        computed.background,
      backgroundColor:
        computed.backgroundColor,
      backgroundImage:
        computed.backgroundImage,
      color:
        computed.color,
      padding:
        computed.padding,
      paddingTop:
        computed.paddingTop,
      paddingBottom:
        computed.paddingBottom,
      paddingLeft:
        computed.paddingLeft,
      paddingRight:
        computed.paddingRight,
      margin:
        computed.margin,
      marginTop:
        computed.marginTop,
      marginBottom:
        computed.marginBottom,
      marginLeft:
        computed.marginLeft,
      marginRight:
        computed.marginRight,
      border:
        computed.border,
      borderRadius:
        computed.borderRadius,
      boxShadow:
        computed.boxShadow,
      width:
        computed.width,
      maxWidth:
        computed.maxWidth,
      display:
        computed.display,
      flexDirection:
        computed.flexDirection,
      flexWrap:
        computed.flexWrap,
      gap:
        computed.gap,
      rowGap:
        computed.rowGap,
      columnGap:
        computed.columnGap,
      alignItems:
        computed.alignItems,
      justifyContent:
        computed.justifyContent
    }
  };
};

const normalizeVisualValue = (
  value: unknown
) =>
  String(value || "")
    .replace(/\s+/g, "")
    .toLowerCase();

const forbiddenCtaRootTags =
  new Set([
    "BODY",
    "HTML"
  ]);

const isTransparentVisualValue = (
  value: unknown
) =>
  [
    "",
    "none",
    "normal",
    "transparent",
    "rgba(0,0,0,0)",
    "rgb(0,0,0,0)",
    "initial",
    "inherit",
    "unset"
  ].includes(
    normalizeVisualValue(
      value
    )
  );

const hasVisualShellStyle = (
  element: HTMLElement
) => {
  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      element
    );

  return (
    !isTransparentVisualValue(
      computed.backgroundColor
    ) ||
    !isTransparentVisualValue(
      computed.backgroundImage
    ) ||
    !normalizeVisualValue(
      computed.border
    ).startsWith(
      "0pxnone"
    ) ||
    (
      normalizeVisualValue(
        computed.borderRadius
      ) !== "0px" &&
      normalizeVisualValue(
        computed.borderRadius
      ) !== "0px0px0px0px"
    ) ||
    !isTransparentVisualValue(
      computed.boxShadow
    )
  );
};

const getElementArea = (
  element: HTMLElement
) => {
  const rect =
    element.getBoundingClientRect();

  return Math.max(
    0,
    rect.width
  ) * Math.max(
    0,
    rect.height
  );
};

const hasCtaTitleAndAction = (
  element: HTMLElement
) =>
  !!element.querySelector(
    "h1,h2,h3,h4"
  ) &&
  !!Array.from(
    element.querySelectorAll(
      "a,button"
    )
  ).find(
    node =>
      !!node.textContent?.trim()
  );

const getCtaShellScore = (
  element: HTMLElement
) => {
  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      element
    );

  const className =
    element.getAttribute(
      "class"
    ) || "";

  let score = 0;

  if (
    hasCtaTitleAndAction(
      element
    )
  ) {
    score += 100;
  }

  if (
    hasVisualShellStyle(
      element
    )
  ) {
    score += 60;
  }

  if (
    !isTransparentVisualValue(
      computed.background
    ) ||
    !isTransparentVisualValue(
      computed.backgroundColor
    ) ||
    !isTransparentVisualValue(
      computed.backgroundImage
    )
  ) {
    score += 40;
  }

  if (
    normalizeVisualValue(
      computed.borderRadius
    ) !== "0px" &&
    normalizeVisualValue(
      computed.borderRadius
    ) !== "0px0px0px0px"
  ) {
    score += 30;
  }

  if (
    /cta|call|panel|card|banner|box|inner|wrap|content/i.test(
      className
    )
  ) {
    score += 20;
  }

  if (
    element.tagName === "SECTION"
  ) {
    score -= 15;
  }

  score += Math.min(
    getElementArea(
      element
    ) / 10000,
    40
  );

  return score;
};

const findCtaVisualShell = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  const root =
    (
      element.closest(
        "section, main, article"
      ) as HTMLElement | null
    ) || element;

  const candidates =
    [
      root,
      ...Array.from(
        root.querySelectorAll(
          "*"
        )
      )
    ].filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement &&
        !forbiddenCtaRootTags.has(
          node.tagName
        ) &&
        hasCtaTitleAndAction(
          node
        ) &&
        hasVisualShellStyle(
          node
        )
    );

  if (!candidates.length) {
    return element;
  }

  return candidates.sort(
    (
      a,
      b
    ) =>
      getCtaShellScore(
        b
      ) -
      getCtaShellScore(
        a
      )
  )[0];
};

const getComputedCtaButtonStyle = (
  element: HTMLElement
) => {
  const computed =
    (
      element.ownerDocument.defaultView ||
      window
    ).getComputedStyle(
      element
    );

  return {
    desktop: {
      background:
        computed.background,
      backgroundColor:
        computed.backgroundColor,
      backgroundImage:
        computed.backgroundImage,
      color:
        computed.color,
      border:
        computed.border,
      borderRadius:
        computed.borderRadius,
      boxShadow:
        computed.boxShadow,
      padding:
        computed.padding,
      paddingTop:
        computed.paddingTop,
      paddingBottom:
        computed.paddingBottom,
      paddingLeft:
        computed.paddingLeft,
      paddingRight:
        computed.paddingRight,
      fontSize:
        computed.fontSize,
      fontWeight:
        computed.fontWeight,
      lineHeight:
        computed.lineHeight,
      textAlign:
        computed.textAlign,
      minWidth:
        computed.minWidth,
      width:
        computed.width,
      maxWidth:
        computed.maxWidth
    }
  };
};

// =====================================
// CTA PRESET
// =====================================

export const generateCTAPreset = (
  payload?: CTAPresetPayload
): Block => {
  console.log(
    "CTA_PRESET_PAYLOAD_IN",
    {
      title:
        payload?.title,
      text:
        payload?.text,
      actionsLength:
        payload?.actions?.length || 0,
      keys:
        Object.keys(
          payload || {}
        )
    }
  );

  const claimedElement =
    payload?.claimedNode?.element;

  const panelElement =
    payload?.panelElement ||
    claimedElement ||
    null;

  const styleRoot =
    findCtaVisualShell(
      panelElement
    ) || panelElement || null;

  const sectionElement =
    payload?.sectionElement ||
    (
      styleRoot?.closest(
        "section"
      ) as HTMLElement | null
    ) ||
    null;

  const containerElement =
    payload?.containerElement ||
    null;
const titleElement =
  styleRoot?.querySelector("h1,h2,h3,h4") as HTMLElement | null;

  const textElement =
    styleRoot?.querySelector(
      "p"
    ) as HTMLElement | null;

  const buttonElement =
    styleRoot?.querySelector(
      "a,button"
    ) as HTMLElement | null;

  const buttonElements =
    styleRoot
      ? Array.from(
          styleRoot.querySelectorAll(
            "a,button"
          )
        ).filter(
          (element): element is HTMLElement =>
            element.nodeType === 1 &&
            !!element.textContent?.trim()
        )
      : [];

  const actionRowElement =
    (
      styleRoot?.querySelector(
        ".cta-actions, .actions, [class*='cta-actions'], [class*='actions']"
      ) ||
      (
        buttonElements.length &&
        buttonElements.every(
          element =>
            element.parentElement ===
            buttonElements[0].parentElement
        )
          ? buttonElements[0].parentElement
          : null
      )
    ) as HTMLElement | null;

  const actions =
    (
      payload?.actions?.length
        ? payload.actions
        : [
            {
              label:
                payload?.button ||
                buttonElement?.textContent?.trim() ||
                "Start Now",
              href:
                buttonElement?.getAttribute(
                  "href"
                ) || ""
            }
          ]
    ).filter(
      action =>
        !!action.label?.trim()
    );

  const rawSectionStyle =
    sectionElement
      ? getComputedCtaPanelStyle(
          sectionElement
        )
      : undefined;

  const containerStyle =
    containerElement
      ? getComputedCtaPanelStyle(
          containerElement
        )
      : undefined;

  const panelStyle =
    styleRoot
      ? getComputedCtaPanelStyle(
          styleRoot
        )
      : undefined;

  const titleStyle =
    titleElement
      ? {
          desktop: {
            ...desktopOf(
              extractLayoutStyles(
                titleElement
              )
            ),
            ...desktopOf(
              extractTypographyStyles(
                titleElement
              )
            )
          }
        }
      : undefined;

  const textStyle =
    textElement
      ? {
          desktop: {
            ...desktopOf(
              extractLayoutStyles(
                textElement
              )
            ),
            ...desktopOf(
              extractTypographyStyles(
                textElement
              )
            )
          }
        }
      : undefined;

  const buttonStyle =
    buttonElement
      ? getComputedCtaButtonStyle(
          buttonElement
        )
      : undefined;

 const mergedSectionStyle =
  mergePresetDesktopStyle(
    {
      paddingTop: "80px",
      paddingBottom: "80px",
      paddingLeft: "40px",
      paddingRight: "40px",
      width: "100%"
    },
      rawSectionStyle,
      filterCtaSectionStyle
    );


  const mergedContainerStyle =
    mergePresetDesktopStyle(
      {
        width: "100%",
        maxWidth: "1280px",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      },
      containerStyle,
      filterCtaContainerStyle
    );

  const mergedPanelStyle =
    mergePresetDesktopStyle(
      {
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "32px",
        padding: "48px"
      },
      panelStyle,
      filterCtaPanelStyle
    );
  
  const sourcePanelDesktop =
    desktopOf(
      panelStyle
    );
  const titleFallbackStyle: Record<string, any> = {
    maxWidth: "820px"
  };

  const mergedTitleStyle =
    mergePresetDesktopStyle(
      titleFallbackStyle,
      titleStyle,
      filterTextStyle
    );

  const titleFontSizeBefore =
    mergedTitleStyle.desktop?.fontSize;

  const ctaTitleStyle: any = {
    ...mergedTitleStyle,
    desktop: {
      ...mergedTitleStyle.desktop,
      maxWidth:
        mergedTitleStyle.desktop?.maxWidth ||
        "820px"
    }
  };

  const mergedTextStyle =
    mergePresetDesktopStyle(
      {
        textAlign: "center",
        maxWidth: "680px"
      },
      textStyle,
      filterTextStyle
    );

  const mergedActionRowStyle =
    mergePresetDesktopStyle(
      {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: "12px",
        justifyContent: "center"
      },
      actionRowElement
        ? extractLayoutStyles(
            actionRowElement
          )
        : undefined,
      filterActionRowStyle
    );

  const mergedPanelTablet =
    (mergedPanelStyle.tablet || {}) as Record<string, any>;
  const mergedPanelMobile =
    (mergedPanelStyle.mobile || {}) as Record<string, any>;
  const mergedActionRowTablet =
    (mergedActionRowStyle.tablet || {}) as Record<string, any>;
  const mergedActionRowMobile =
    (mergedActionRowStyle.mobile || {}) as Record<string, any>;


  const leftTitleStyle = {
    ...ctaTitleStyle,
    desktop: {
      ...(ctaTitleStyle.desktop || {}),
      textAlign: "left"
    }
  };

  const leftTextStyle = {
    ...mergedTextStyle,
    desktop: {
      ...(mergedTextStyle.desktop || {}),
      textAlign: "left",
      marginLeft: "0",
      marginRight: "0"
    }
  };

const cleanNormal = (
  value: any,
  fallback?: any
) =>
  value === "normal" ||
  value === "" ||
  value === undefined
    ? fallback
    : value;

const inheritResponsiveFlexStyle = (
  desktop: Record<string, any> = {},
  device: Record<string, any> = {},
  options?: {
    forceFluidWidth?: boolean;
  }
) => {
  const merged = {
    ...desktop,
    ...device
  };

  return {
    ...merged,

    width:
      options?.forceFluidWidth
        ? "100%"
        : cleanNormal(
            device.width,
            cleanNormal(
              desktop.width,
              undefined
            )
          ),

    maxWidth:
      "100%",

    boxSizing:
      cleanNormal(
        device.boxSizing,
        cleanNormal(
          desktop.boxSizing,
          "border-box"
        )
      ),

    flexWrap:
      cleanNormal(
        device.flexWrap,
        cleanNormal(
          desktop.flexWrap,
          "wrap"
        )
      ),

    alignItems:
      cleanNormal(
        device.alignItems,
        cleanNormal(
          desktop.alignItems,
          "center"
        )
      ),

    justifyContent:
      cleanNormal(
        device.justifyContent,
        cleanNormal(
          desktop.justifyContent,
          "center"
        )
      )
  };
};
const panelDesktopStyle =
  mergedPanelStyle.desktop || {};

const actionRowDesktopStyle =
  mergedActionRowStyle.desktop || {};

const actionButtons =
  actions.map(
    (
      action,
      index
    ) => {
      const actionElement =
        buttonElements[index] ||
        buttonElement;

      const actionStyle =
        actionElement
          ? getComputedCtaButtonStyle(
              actionElement
            )
          : buttonStyle;

     return {
  id: uuidv4(),

  type: "button" as const,

  data: {
    props: {
      label: action.label,
      href: action.href || ""
    },

    style: {
      ...mergePresetDesktopStyle(
        {
          paddingTop: "14px",
          paddingBottom: "14px",
          paddingLeft: "24px",
          paddingRight: "24px"
        },
        actionStyle,
        filterCtaButtonStyle
      )
    }
  },

  children: []
};
    }
  );

const finalBlock: Block = {
  id:
    uuidv4(),

  type:
    "section" as const,

  meta: {
    semanticType:
      "CTA_SECTION"
  },

  data: {
    props: {},

    style: {
      ...mergedSectionStyle
    }
  },

  children: [
    {
      id: uuidv4(),

      type: "flex" as const,

      data: {
        props: {},

        style: {
          ...mergedContainerStyle,
          ...mergedPanelStyle,

          desktop: {
            ...(mergedContainerStyle.desktop || {}),
            ...(mergedPanelStyle.desktop || {}),

            width: "100%",

            maxWidth:
              mergedContainerStyle.desktop?.maxWidth ||
              "1280px",

            marginLeft: "auto",
            marginRight: "auto",

            flexDirection:
              sourcePanelDesktop.flexDirection ||
              mergedPanelStyle.desktop?.flexDirection ||
              "row",

            alignItems:
              sourcePanelDesktop.alignItems ||
              mergedPanelStyle.desktop?.alignItems ||
              "center",

            justifyContent:
              sourcePanelDesktop.justifyContent ||
              mergedPanelStyle.desktop?.justifyContent ||
              "space-between",

            flexWrap:
              sourcePanelDesktop.flexWrap ||
              mergedPanelStyle.desktop?.flexWrap ||
              "nowrap",

            gap:
              sourcePanelDesktop.gap ||
              sourcePanelDesktop.rowGap ||
              mergedPanelStyle.desktop?.gap ||
              "32px"
          },

          tablet:
            inheritResponsiveFlexStyle(
              panelDesktopStyle,
              mergedPanelTablet,
              {
                forceFluidWidth: true
              }
            ),

          mobile: {
            ...inheritResponsiveFlexStyle(
              panelDesktopStyle,
              mergedPanelMobile,
              {
                forceFluidWidth: true
              }
            ),

            flexDirection: "column",
            alignItems: "stretch"
          }
        }
      },

      children: [
        {
          id: uuidv4(),

          type: "flexItem" as const,

          data: {
            props: {},

            style: {
              desktop: {
                flex: "1 1 520px",
                minWidth: "0",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: "12px"
              },

              tablet: {
                flex: "1 1 100%",
                minWidth: "0",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px"
              },

              mobile: {
                flex: "1 1 100%",
                width: "100%",
                minWidth: "0",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "12px"
              }
            }
          },

          children: [
            {
              id: uuidv4(),

              type: "title" as const,

              data: {
                props: {
                  content:
                    payload?.title ||
                    "Ready to get started?",

                  segments:
                    payload?.titleSegments || []
                },

                style: {
                  ...leftTitleStyle
                }
              },

              children: []
            },

            ...(payload?.text
              ? [
                  {
                    id: uuidv4(),

                    type: "text" as const,

                    data: {
                      props: {
                        content: payload.text
                      },

                      style: {
                        ...leftTextStyle
                      }
                    },

                    children: []
                  } as Block
                ]
              : [])
          ]
        },

        {
          id: uuidv4(),

          type: "flexItem" as const,

          data: {
            props: {},

            style: {
              desktop: {
                flex: "0 0 auto",
                width: "auto",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px"
              },

              tablet: {
                width: "auto",
                maxWidth: "100%",
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "12px"
              },

              mobile: {
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px"
              }
            }
          },

          children: actionButtons
        }
      ]
    }
  ]
};

  return finalBlock;
};