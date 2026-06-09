import { v4 as uuidv4 } from "uuid";

import type {
  Block
} from "../types/page.types";
import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../runtime/importers/css/extractStyleProps";
import {
  filterCardStyle,
  filterSectionStyle,
  filterTextStyle,
  mergePresetDesktopStyle
} from "./styleFilters";

// =====================================
// PAYLOAD TYPES
// =====================================

interface CTAPresetPayload {

  title?: string;

  text?: string;

  button?: string;

  actions?: Array<{
    label?: string;
    href?: string;
  }>;

  claimedNode?: {
    element?: HTMLElement;
  };
}

const desktopOf = (
  style: any
) =>
  style?.desktop || style || {};

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

  const ctaElement =
    (
      claimedElement?.matches(
        "[class*='cta' i], [id*='cta' i], [class*='final' i], [id*='final' i]"
      )
        ? claimedElement
        : claimedElement?.querySelector(
            "[class*='cta' i], [id*='cta' i], [class*='final' i], [id*='final' i]"
          )
    ) as HTMLElement | null;

  const styleRoot =
    ctaElement || claimedElement || null;

  const titleElement =
    styleRoot?.querySelector(
      "h1,h2"
    ) as HTMLElement | null;

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

  const sectionStyle =
    styleRoot
      ? extractLayoutStyles(
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
      ? {
          desktop: {
            ...desktopOf(
              extractLayoutStyles(
                buttonElement
              )
            ),
            ...desktopOf(
              extractTypographyStyles(
                buttonElement
              )
            )
          }
        }
      : undefined;

  const mergedSectionStyle =
    mergePresetDesktopStyle(
      {
        paddingTop: "100px",
        paddingBottom: "100px",
        paddingLeft: "24px",
        paddingRight: "24px",
        backgroundColor: "#111827"
      },
      sectionStyle,
      filterSectionStyle
    );

  const titleFallbackStyle = {
    textAlign: "center",
    fontSize: "48px",
    fontWeight: "800",
    color: "#ffffff"
  };

  const mergedTitleStyle =
    mergePresetDesktopStyle(
      titleFallbackStyle,
      titleStyle,
      filterTextStyle
    );

  const mergedTextStyle =
    mergePresetDesktopStyle(
      {
        textAlign: "center",
        fontSize: "18px",
        color: "#d1d5db",
        maxWidth: "680px",
        lineHeight: "1.7"
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
        mergedTitleStyle.desktop?.fontSize,
      titleMaxWidthBefore:
        titleFallbackStyle.maxWidth,
      titleMaxWidthAfter:
        mergedTitleStyle.desktop?.maxWidth,
      cardPadding:
        mergedSectionStyle.desktop?.padding ||
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

  console.log(
    "CTA_CONTAINER_REPORT",
    {
      titleMaxWidth:
        mergedTitleStyle.desktop?.maxWidth,
      titleFontSize:
        mergedTitleStyle.desktop?.fontSize,
      titleLineHeight:
        mergedTitleStyle.desktop?.lineHeight,
      textMaxWidth:
        mergedTextStyle.desktop?.maxWidth,
      cardWidth:
        mergedSectionStyle.desktop?.width,
      cardMaxWidth:
        mergedSectionStyle.desktop?.maxWidth,
      flexItemWidth:
        "100%",
      flexItemMaxWidth:
        undefined
    }
  );

  return {

    id: uuidv4(),

    type: "section" as const,

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

            desktop: {

              flexDirection: "column",

              alignItems: "center",

              justifyContent: "center",

              gap: "20px"
            },

            tablet: {},

            mobile: {}
          }
        },

        children: [

          // =====================
          // TITLE ITEM
          // =====================

          {
            id: uuidv4(),

            type: "flexItem" as const,

            data: {

              props: {},

              style: {

                desktop: {

                  width: "100%",

                  display: "flex",

                  justifyContent: "center"
                },

                tablet: {},

                mobile: {}
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

                      "Ready to get started?"
                  },

                  style: {

                    ...mergedTitleStyle
                  }
                },

                children: []
              }
            ]
          },

          // =====================
          // TEXT ITEM
          // =====================

          {
            id: uuidv4(),

            type: "flexItem" as const,

            data: {

              props: {},

              style: {

                desktop: {

                  width: "100%",

                  display: "flex",

                  justifyContent: "center"
                },

                tablet: {},

                mobile: {}
              }
            },

            children: [
              {
                id: uuidv4(),

                type: "text" as const,

                data: {

                  props: {

                    content:

                      payload?.text ||

                      "Start building your next experience today."
                  },

                  style: {

                    ...mergedTextStyle
                  }
                },

                children: []
              }
            ]
          },

          // =====================
          // ACTIONS ROW
          // =====================

          {
            id: uuidv4(),

            type: "flex" as const,

            data: {

              props: {
                direction: "row"
              },

              style: {

                ...mergedActionRowStyle
              }
            },

            children:
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
                      ? {
                          desktop: {
                            ...desktopOf(
                              extractLayoutStyles(
                                actionElement
                              )
                            ),
                            ...desktopOf(
                              extractTypographyStyles(
                                actionElement
                              )
                            )
                          }
                        }
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
                        backgroundColor:
                          "#10b981",
                        color:
                          "#ffffff",
                        borderRadius:
                          "14px",
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
                      filterCardStyle
                    )
                  }
                },

                children: []
              }
                    ]
                  };
                }
              )
          }
        ]
      }
    ]
  };
};
