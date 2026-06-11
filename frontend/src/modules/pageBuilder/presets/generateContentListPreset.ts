
import type { Block } from "../types/page.types";

const getDesktopStyle = (
  element?: HTMLElement | null
) => {
  if (!element) return {};

  const computed =
    element.ownerDocument.defaultView?.getComputedStyle(element) ||
    window.getComputedStyle(element);

  return {
    padding: computed.padding,
    margin: computed.margin,
    border: computed.border,
    borderRadius: computed.borderRadius,
    background: computed.background,
    backgroundColor: computed.backgroundColor,
    backgroundImage: computed.backgroundImage,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    marginBottom: computed.marginBottom,
    borderBottom: computed.borderBottom,
    color: computed.color
  };
};

export const generateContentListPreset = (
  semanticResult: any
): Block => {

  const payload =
    semanticResult?.payload ||
    semanticResult;

  const sourceElement =
    semanticResult?.claimedNode?.element as HTMLElement | undefined;

  const titleElement =
    sourceElement?.querySelector(
      ":scope > h2, :scope > h3"
    ) as HTMLElement | null;

  const descElement =
    sourceElement?.querySelector(
      ":scope > p"
    ) as HTMLElement | null;

  const listItems =
    sourceElement
      ? Array.from(
          sourceElement.querySelectorAll(
            ":scope > ul > li, :scope > ol > li"
          )
        ) as HTMLElement[]
      : [];

  console.log(
    "CONTENT_LIST_SOURCE",
    {
      className:
        sourceElement?.className,
      tag:
        sourceElement?.tagName
    }
  );

  const sourceStyle =
    getDesktopStyle(sourceElement);

  console.log(
    "CONTENT_LIST_SECTION_STYLE",
    sourceStyle
  );

  const titleStyle =
    getDesktopStyle(titleElement);

  const descStyle =
    getDesktopStyle(descElement);

  const firstItemStyle =
    getDesktopStyle(listItems[0]);

  console.log(
    "CONTENT_LIST_TEXT_COLOR",
    firstItemStyle
  );

  const items =
    Array.isArray(payload.items)
      ? payload.items
      : [];

  const id =
    crypto.randomUUID();

  return {
    id: `content-list-section-${id}`,

    type: "section",

    meta: {
      semanticType:
        "CONTENT_LIST_SECTION"
    },

    data: {
      props: {},

      style: {
        desktop: {
          padding:
            sourceStyle.padding ||
            "48px 40px",

          margin:
            sourceStyle.margin,

          borderRadius:
            sourceStyle.borderRadius,

          border:
            sourceStyle.border,

          background:
            sourceStyle.background,

          backgroundColor:
            sourceStyle.backgroundColor,

          backgroundImage:
            sourceStyle.backgroundImage,

          color: "#0f172a"
        },

        tablet: {},

        mobile: {}
      }
    },

    children: [
      {
        id:
          `content-list-flex-${id}`,

        type:
          "flex",

        data: {
          props: {},

          style: {
            desktop: {
              flexDirection:
                "column",

              gap:
                "16px"
            },

            tablet: {},

            mobile: {}
          }
        },

        children: [
          {
            id:
              `content-list-item-${id}`,

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
                  `content-list-title-${id}`,

                type:
                  "title",

                data: {
                  props: {
                    content:
                      payload.title || ""
                  },

                  style: {
                    desktop: {
                      fontSize:
                        titleStyle.fontSize,

                      fontWeight:
                        titleStyle.fontWeight,

                      lineHeight:
                        titleStyle.lineHeight,

                      marginBottom:
                        titleStyle.marginBottom,

                      color: "#0f172a"
                    },

                    tablet: {},

                    mobile: {}
                  }
                },

                children: []
              },

              ...(payload.description
                ? [
                    {
                      id:
                        `content-list-desc-${id}`,

                      type:
                        "text",

                      data: {
                        props: {
                          content:
                            payload.description
                        },

                        style: {
                          desktop: {
                            fontSize:
                              descStyle.fontSize,

                            fontWeight:
                              descStyle.fontWeight,

                            lineHeight:
                              descStyle.lineHeight,

                            marginBottom:
                              descStyle.marginBottom,

                            color: "#0f172a"
                          },

                          tablet: {},

                          mobile: {}
                        }
                      },

                      children: []
                    }
                  ]
                : []),

              ...items.map(
                (
                  item: string,
                  index: number
                ) => ({
                  id:
                    `content-list-row-${id}-${index}`,

                  type:
                    "text",

                  data: {
                    props: {
                      content:
                        `→ ${item}`
                    },

                    style: {
                      desktop: {
                        fontSize:
                          firstItemStyle.fontSize,

                        fontWeight:
                          firstItemStyle.fontWeight,

                        lineHeight:
                          firstItemStyle.lineHeight,

                        padding:
                          firstItemStyle.padding,

                        borderBottom:
                          index ===
                          items.length - 1
                            ? "none"
                            : firstItemStyle.borderBottom,

                        color:
                          firstItemStyle.color
                      },

                      tablet: {},

                      mobile: {}
                    }
                  },

                  children: []
                })
              )
            ]
          }
        ]
      }
    ]
  };
};