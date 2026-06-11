import type { Block } from "../types/page.types";

const getDesktopStyle = (
  element?: HTMLElement | null
) => {
  if (!element) return {};

  const computed =
    element.ownerDocument.defaultView?.getComputedStyle(
      element
    ) ||
    window.getComputedStyle(
      element
    );

  return {
    display:
      computed.display,

    justifyContent:
      computed.justifyContent,

    alignItems:
      computed.alignItems,

    gap:
      computed.gap,

    flexWrap:
      computed.flexWrap,

    padding:
      computed.padding,

    margin:
      computed.margin,

    border:
      computed.border,

    borderRadius:
      computed.borderRadius,

    background:
      computed.background,

    backgroundColor:
      computed.backgroundColor,

    backgroundImage:
      computed.backgroundImage,

    fontSize:
      computed.fontSize,

    fontWeight:
      computed.fontWeight,

    lineHeight:
      computed.lineHeight,

    letterSpacing:
      computed.letterSpacing,

    textTransform:
      computed.textTransform,

    color:
      computed.color
  };
};

export const generateInfoBannerPreset = (
  semanticResult: any
): Block => {

  const payload =
    semanticResult?.payload ||
    semanticResult;

  const sourceElement =
    semanticResult?.claimedNode
      ?.element as HTMLElement | undefined;

  const labelElement =
    sourceElement?.querySelector(
      ":scope div div:first-child"
    ) as HTMLElement | null;

  const valueElement =
    sourceElement?.querySelector(
      ":scope div div:nth-child(2)"
    ) as HTMLElement | null;

  const actionElement =
    sourceElement?.querySelector(
      ":scope > a, :scope > button"
    ) as HTMLElement | null;

  console.log(
    "INFO_BANNER_SOURCE",
    {
      className:
        sourceElement?.className,
      tag:
        sourceElement?.tagName
    }
  );

  const sourceStyle =
    getDesktopStyle(
      sourceElement
    );


  const labelStyle =
    getDesktopStyle(
      labelElement
    );

  const valueStyle =
    getDesktopStyle(
      valueElement
    );
     console.log(
  "INFO_BANNER_FINAL",
  {
    background:
      sourceStyle.background,
    backgroundColor:
      sourceStyle.backgroundColor,
    backgroundImage:
      sourceStyle.backgroundImage,
    textColor:
      valueStyle.color
  }
);

  const actionStyle =
    getDesktopStyle(
      actionElement
    );

  const id =
    crypto.randomUUID();

  const actionChildren:
    Block[] =

    payload.actionText

      ? [
          {
            id:
              `info-banner-action-${id}`,

            type:
              "flexItem",

            data: {
              props: {},

              style: {
                desktop: {},
                tablet: {},
                mobile: {}
              }
            },

            children: [
              {
                id:
                  `info-banner-button-${id}`,

                type:
                  "button",

                data: {
                  props: {
                    label:
                      payload.actionText,

                    href:
                      payload.actionHref ||
                      "#"
                  },

                  style: {
                    desktop: {
                      display:
                        actionStyle.display,

                      fontSize:
                        actionStyle.fontSize,

                      fontWeight:
                        actionStyle.fontWeight,

                      color: valueStyle.color
                    },

                    tablet: {},

                    mobile: {}
                  }
                },

                children: []
              }
            ]
          }
        ]

      : [];

  return {

    id:
      `info-banner-section-${id}`,

    type:
      "section",

    meta: {
      semanticType:
        "INFO_BANNER"
    },

    data: {
      props: {},

      style: {

        desktop: {

          padding:
            sourceStyle.padding ||
            "32px 40px",

          margin:
            sourceStyle.margin,

          borderRadius:
            sourceStyle.borderRadius,

          border:
            sourceStyle.border,

          background:
            sourceStyle.background,

         backgroundColor: "#020B18",

          backgroundImage:
            sourceStyle.backgroundImage,
            color: valueStyle.color

        },

        tablet: {},

        mobile: {}
      }
    },

    children: [
      {
        id:
          `info-banner-flex-${id}`,

        type:
          "flex",

        data: {
          props: {},

          style: {
            desktop: {
              display:
                "flex",

              justifyContent:
                sourceStyle.justifyContent ||
                "space-between",

              alignItems:
                sourceStyle.alignItems ||
                "center",

              gap:
                sourceStyle.gap ||
                "24px",

              flexWrap:
                sourceStyle.flexWrap ||
                "wrap"
            },

            tablet: {},

            mobile: {
              flexDirection:
                "column",

              alignItems:
                "flex-start"
            }
          }
        },

        children: [
          {
            id:
              `info-banner-copy-${id}`,

            type:
              "flexItem",

            data: {
              props: {},

              style: {
                desktop: {},
                tablet: {},
                mobile: {}
              }
            },

            children: [

              {
                id:
                  `info-banner-label-${id}`,

                type:
                  "text",

                data: {
                  props: {
                    content:
                      payload.label || ""
                  },

                  style: {
                    desktop: {
                      fontSize:
                        labelStyle.fontSize,

                      fontWeight:
                        labelStyle.fontWeight,

                      letterSpacing:
                        labelStyle.letterSpacing,

                      textTransform:
                        labelStyle.textTransform,

                      color: valueStyle.color                    },

                    tablet: {},

                    mobile: {}
                  }
                },

                children: []
              },

              {
                id:
                  `info-banner-value-${id}`,

                type:
                  "text",

                data: {
                  props: {
                    content:
                      payload.value || ""
                  },

                  style: {
                    desktop: {
                      fontSize:
                        valueStyle.fontSize,

                      fontWeight:
                        valueStyle.fontWeight,

                      lineHeight:
                        valueStyle.lineHeight,
                      color: valueStyle.color
                    },

                    tablet: {},

                    mobile: {}
                  }
                },

                children: []
              }
            ]
          },

          ...actionChildren
        ]
      }
    ]
  };
};