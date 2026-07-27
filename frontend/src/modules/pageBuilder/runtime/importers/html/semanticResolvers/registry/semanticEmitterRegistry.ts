import type {
  SemanticPayload
} from "../../emitters/emitSemanticBlock";

import {
  generateContactLayoutPreset
} from "../../../../../presets/generateContactLayoutPreset";

import {
  presetRegistry
} from "../../../../../presets/presetRegistry";
import { generateNavbarPreset } from "../../../../../presets/generateNavbarPreset";
import { extractLayoutStyles } from "../../../css/extractStyleProps";
import { emitServicePageSectionBlock } from "../servicePageSection/servicePageSectionEmitter";

const generateCTAGroupPreset = (
  payload: any
) => {
  const hasActions =
    Array.isArray(
      payload?.actions
    ) &&
    payload.actions.length > 0;

  const forwardedPayload =
    hasActions
      ? {
          ...payload,
          title:payload?.title || "",
          text:
            payload?.text ||
            payload?.description ||
            "",
          actions:
            payload.actions
        }
      : {
          title:
            payload?.title ||
            "Ready to get started?",
          text:
            payload?.text ||
            payload?.description ||
            "",
          button:
            payload?.button ||
            "Start Now"
        };

  console.log(
    "CTA_EMITTER_FORWARD_ACTIONS",
    {
      incomingActionsLength:
        payload?.actions?.length || 0,
      forwardedActionsLength:
        forwardedPayload.actions?.length || 0,
      fallbackButtonUsed:
        !hasActions
    }
  );

  return presetRegistry.cta(
    forwardedPayload
  );
};

const debugMissingRepeatedEntityEmitter = (
  payload: any
) => {
  console.log(
    "REPEATED_ENTITY_PAYLOAD_DEBUG",
    {
      type:
        payload?.type,
      keys:
        Object.keys(
          payload || {}
        ),
      payload
    }
  );

  return null;
};

const getDesktopLayoutStyle = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return {};
  }

  const extracted =
    extractLayoutStyles(element);

  return {
    ...(extracted.desktop || {})
  };
};

const preserveContainerLayout = (
  element?: HTMLElement | null,
  fallback: Record<string, any> = {}
) => {
  const desktop =
    getDesktopLayoutStyle(element);

  const maxWidth =
    desktop.maxWidth &&
    desktop.maxWidth !== "none"
      ? desktop.maxWidth
      : "100%";

  const marginLeft =
    desktop.marginLeft || "auto";

  const marginRight =
    desktop.marginRight || "auto";

  return {
    desktop: {
      ...(fallback.desktop || fallback || {}),
      ...desktop,
      width: "100%",
      maxWidth,
      marginLeft,
      marginRight,
      boxSizing: "border-box",
      minWidth: "0",
      overflow: "visible"
    },
    tablet: {
      ...(fallback.tablet || {}),
      width: "100%",
      maxWidth: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
      minWidth: "0"
    },
    mobile: {
      ...(fallback.mobile || {}),
      width: "100%",
      maxWidth: "100%",
      marginLeft: "auto",
      marginRight: "auto",
      boxSizing: "border-box",
      minWidth: "0"
    }
  };
};

const emitOfficeListBlock = (
  payload: any
) => {
  const root =
    payload?.claimedNode?.element as
      | HTMLElement
      | undefined;

  const sectionStyle =
    preserveContainerLayout(root, {
      desktop: {
        width: "100%",
        padding: "64px 24px",
        boxSizing: "border-box"
      }
    });

  const containerElement =
    root?.querySelector(
      "section, main, article, div, aside"
    ) as HTMLElement | null;

  const containerStyle =
    preserveContainerLayout(containerElement || root, {
      desktop: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%"
      }
    });

  const gridElement =
    root?.querySelector(
      "[style*='display: grid'], [style*='display:grid']"
    ) as HTMLElement | null;

  const gridStyle =
    gridElement
      ? preserveContainerLayout(gridElement, {
          desktop: {
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "24px"
          }
        })
      : null;

  const items =
    (payload?.items || []).map(
      (item: any, index: number) => ({
        id: `office-list-item-${index}`,
        type: "flex",
        data: {
          props: {},
          style: {
            desktop: {
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              width: "100%",
              boxSizing: "border-box"
            },
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
        children: [
          {
            id: `office-list-label-${index}`,
            type: "text",
            data: {
              props: {
                content:
                  item?.label || ""
              },
              style: {
                desktop: {
                  margin: "0"
                }
              }
            },
            children: []
          },
          {
            id: `office-list-value-${index}`,
            type: "text",
            data: {
              props: {
                content:
                  item?.value || ""
              },
              style: {
                desktop: {
                  margin: "0"
                }
              }
            },
            children: []
          }
        ]
      })
    );

  return {
    id: "office-list-section",
    type: "section",
    meta: {
      semanticType: "OFFICE_LIST"
    },
    data: {
      props: {},
      style: sectionStyle
    },
    children: [
      {
        id: "office-list-container",
        type: "flex",
        data: {
          props: {},
          style: {
            ...containerStyle,
            desktop: {
              ...containerStyle.desktop,
              ...(gridStyle?.desktop?.display === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns:
                      gridStyle.desktop.gridTemplateColumns ||
                      "repeat(2, minmax(0, 1fr))",
                    gap:
                      gridStyle.desktop.gap || "24px"
                  }
                : {})
            },
            tablet: {
              ...containerStyle.tablet,
              ...(gridStyle?.desktop?.display === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
                  }
                : {})
            },
            mobile: {
              ...containerStyle.mobile,
              ...(gridStyle?.desktop?.display === "grid"
                ? {
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr)"
                  }
                : {})
            }
          }
        },
        children: items
      }
    ]
  };
};

export const semanticEmitterRegistry:

Partial<

  Record<
    SemanticPayload["type"],
    Function
  >

> = {

  NAVBAR: generateNavbarPreset,

  HERO_SECTION:
    presetRegistry.hero,

  FEATURE_PILLARS:
    presetRegistry.featurePillars,


  OFFICES_TABLE:
    presetRegistry.officeTable,

  VALUES_GRID:
    presetRegistry.valuesGrid,

  CONTACT_LAYOUT:
    generateContactLayoutPreset,

  CTA_GROUP:
    generateCTAGroupPreset,

  CTA_SECTION:
    generateCTAGroupPreset,

  INSIGHTS_SECTION:
    presetRegistry.insights,

  TRUST_LOGO_SECTION:
    presetRegistry.trustLogo,

    CONTENT_LIST_SECTION:
  presetRegistry.contentList,

  INFO_BANNER:
  presetRegistry.infoBanner,

  TWO_COLUMN_INTRO:
  presetRegistry.twoColumnIntro,

  CTA_CARD:
  generateCTAGroupPreset,

  SERVICE_PAGE_SECTION:
  emitServicePageSectionBlock,
  
  LABEL_VALUE_GROUP:
    debugMissingRepeatedEntityEmitter,

  CONTACT_TABLE:
    debugMissingRepeatedEntityEmitter,

  OFFICE_LIST:
    emitOfficeListBlock,
    
};
