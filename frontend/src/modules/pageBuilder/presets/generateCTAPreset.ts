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

const findCtaVisualShell = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  if (
    forbiddenCtaRootTags.has(
      element.tagName
    )
  ) {
    return null;
  }

  const boundary =
    element.closest(
      "section, main, article"
    ) as HTMLElement | null;

  const buttons =
    Array.from(
      element.querySelectorAll(
        "a,button"
      )
    ).filter(
      (node): node is HTMLElement =>
        node.nodeType === 1 &&
        !!node.textContent?.trim()
    );

  for (const button of buttons) {
    let current =
      button.parentElement;

    while (current) {
      if (
        forbiddenCtaRootTags.has(
          current.tagName
        )
      ) {
        break;
      }

      if (
        current !== button &&
        hasVisualShellStyle(
          current
        )
      ) {
        return current;
      }

      if (
        current === element ||
        current === boundary
      ) {
        break;
      }

      current =
        current.parentElement;
    }
  }

  let current: HTMLElement | null =
    element;

  while (current) {
    if (
      forbiddenCtaRootTags.has(
        current.tagName
      )
    ) {
      break;
    }

    if (
      hasVisualShellStyle(
        current
      )
    ) {
      return current;
    }

    if (current === boundary) {
      break;
    }

    current =
      current.parentElement;
  }

  return element;
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

  console.log(
    "CTA_STYLE_ROOT_SELECTED",
    {
      claimed:
        claimedElement
          ? {
              tag:
                claimedElement.tagName,
              className:
                claimedElement.getAttribute(
                  "class"
                ) || "",
              id:
                claimedElement.id || ""
            }
          : null,
      styleRoot:
        styleRoot
          ? {
              tag:
                styleRoot.tagName,
              className:
                styleRoot.getAttribute(
                  "class"
                ) || "",
              id:
                styleRoot.id || ""
            }
          : null,
      style:
        styleRoot
          ? desktopOf(
              getComputedCtaPanelStyle(
                styleRoot
              )
            )
          : null
    }
  );

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
    console.log(
  "CTA_PANEL_PADDING_COMPARE",
  {
    panelRaw:
      panelStyle?.desktop?.padding,
    panelMerged:
      mergedPanelStyle.desktop?.padding,
    sectionMerged:
      mergedSectionStyle.desktop?.padding ||
      `${mergedSectionStyle.desktop?.paddingTop} ${mergedSectionStyle.desktop?.paddingRight} ${mergedSectionStyle.desktop?.paddingBottom} ${mergedSectionStyle.desktop?.paddingLeft}`
  }
);

  const sourcePanelDesktop =
    desktopOf(
      panelStyle
    );

  console.log(
    "CTA_SELECTED_PANEL_STYLE",
    desktopOf(
      panelStyle
    )
  );

  console.log(
    "CTA_SECTION_STYLE",
    desktopOf(
      rawSectionStyle
    )
  );

  console.log(
    "CTA_CONTAINER_STYLE",
    desktopOf(
      containerStyle
    )
  );

  console.log(
    "CTA_SOURCE_LAYOUT",
    {
      display:
        sourcePanelDesktop.display,
      flexDirection:
        sourcePanelDesktop.flexDirection,
      justifyContent:
        sourcePanelDesktop.justifyContent,
      alignItems:
        sourcePanelDesktop.alignItems,
      gap:
        sourcePanelDesktop.gap
    }
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

  console.log(
    "CTA_TITLE_SCALE_CLAMPED",
    {
      before:
        titleFontSizeBefore,
      after:
        ctaTitleStyle.desktop?.fontSize,
      maxWidth:
        ctaTitleStyle.desktop?.maxWidth,
      reason:
        titleFontSizeBefore
          ? "source-font-size"
          : "no-font-size-fallback"
    }
  );

  console.log(
    "CTA_PRESET_ACTIONS_RENDERED",
    {
      payloadActionsCount:
        payload?.actions?.length || 0,
      renderedButtonsCount:
        actions.length,
      actions
    }
  );

  console.log(
    "CTA_VISUAL_STYLE_APPLIED",
    {
      titleFontSizeBefore:
        titleFallbackStyle.fontSize,
      titleFontSizeAfter:
        ctaTitleStyle.desktop?.fontSize,
      titleMaxWidthBefore:
        titleFallbackStyle.maxWidth,
      titleMaxWidthAfter:
        ctaTitleStyle.desktop?.maxWidth,
      cardPadding:
        mergedPanelStyle.desktop?.padding ||
        [
          mergedSectionStyle.desktop?.paddingTop,
          mergedSectionStyle.desktop?.paddingRight,
          mergedSectionStyle.desktop?.paddingBottom,
          mergedSectionStyle.desktop?.paddingLeft
        ]
          .filter(Boolean)
          .join(" "),
      actionGap:
        mergedActionRowStyle.desktop?.gap ||
        mergedActionRowStyle.desktop?.columnGap ||
        mergedActionRowStyle.desktop?.rowGap,
      buttonCount:
        actions.length
    }
  );

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

  console.log(
    "CTA_TITLE_STYLE",
    leftTitleStyle
  );

  const actionItems =
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

          type: "flexItem" as const,

          data: {

            props: {},

            style: {

              desktop: {

                flex: "0 0 auto",

                width: "auto",

                maxWidth: "none"
              },

              tablet: {},

              mobile: {}
            }
          },

          children: [
            {
              id: uuidv4(),

              type: "button" as const,

              data: {

                props: {

                  label:
                    action.label,

                  href:
                    action.href || ""
                },

                style: {

                    ...mergePresetDesktopStyle(
                      {
                        paddingTop:
                          "14px",
                      paddingBottom:
                        "14px",
                      paddingLeft:
                        "24px",
                      paddingRight:
                        "24px"
                    },
                    actionStyle,
                    filterCtaButtonStyle
                  )
                }
              },

              children: []
            }
          ]
        };
      }
    );

  const finalBlock: Block = {

    id: uuidv4(),

    type: "section" as const,
     meta: {
    semanticType: "CTA_SECTION",
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

            ...mergedContainerStyle
          }
        },

        children: [
          {
            id: uuidv4(),

            type: "flex" as const,

            data: {

              props: {},

              style: {

                ...mergedPanelStyle,
                desktop: {
                  ...(mergedPanelStyle.desktop || {}),
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
                tablet: {
                  ...mergedPanelTablet,
                  flexDirection:
                    mergedPanelTablet.flexDirection ||
                    "column",
                  alignItems:
                    mergedPanelTablet.alignItems ||
                    "flex-start",
                  flexWrap:
                    mergedPanelTablet.flexWrap ||
                    "wrap",
                  width:
                    mergedPanelTablet.width ||
                    "100%"
                },
                mobile: {
                  ...mergedPanelMobile,
                  flexDirection:
                    mergedPanelMobile.flexDirection ||
                    "column",
                  alignItems:
                    mergedPanelMobile.alignItems ||
                    "stretch",
                  flexWrap:
                    mergedPanelMobile.flexWrap ||
                    "wrap",
                  width:
                    mergedPanelMobile.width ||
                    "100%"
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

                tablet: {},

                mobile: {
                  width: "100%"
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

                          content:
                            payload.text
                        },

                        style: {

                          ...leftTextStyle
                        }
                      },

                      children: []
                    }
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
                  alignSelf: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                },

                tablet: {},

                mobile: {
                  width: "100%",
                  alignSelf: "stretch"
                }
              }
            },

            children: [
              {
                id: uuidv4(),

                type: "flex" as const,

                data: {

                  props: {
                    direction: "row"
                  },

                  style: {

                    ...mergedActionRowStyle,
                    desktop: {
                      ...(mergedActionRowStyle.desktop || {}),
                      alignItems:
                        mergedActionRowStyle.desktop?.alignItems ||
                        "center",
                      justifyContent:
                        mergedActionRowStyle.desktop?.justifyContent ||
                        "center"
                    },
                    tablet: {
                      ...mergedActionRowTablet,
                      width:
                        mergedActionRowTablet.width ||
                        "100%"
                    },
                    mobile: {
                      ...mergedActionRowMobile,
                      width:
                        mergedActionRowMobile.width ||
                        "100%",
                      flexDirection:
                        mergedActionRowMobile.flexDirection ||
                        "column"
                    }
                  }
                },

                children:
                  actionItems
              }
            ]
          }
            ]
          }
        ]
      }
    ]
  };

  console.log(
    "CTA_FINAL_TREE",
    {
      type:
        finalBlock.type,
      sectionStyle:
        finalBlock.data?.style,
      containerType:
        finalBlock.children?.[0]?.type,
      containerStyle:
        finalBlock.children?.[0]?.data?.style,
      panelType:
        finalBlock.children?.[0]?.children?.[0]?.type,
      panelStyle:
        finalBlock.children?.[0]?.children?.[0]?.data?.style,
      panelChildren:
        finalBlock.children?.[0]?.children?.[0]?.children?.map(
          child => child.type
        )
    }
  );

  return finalBlock;
};
