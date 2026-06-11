import type { Block } from "../types/page.types";

const getDesktopStyle = (element?: HTMLElement | null) => {
  if (!element) return {};

  const computed =
    element.ownerDocument.defaultView?.getComputedStyle(element) ||
    window.getComputedStyle(element);

  return {
    display: computed.display,
    gap: computed.gap,
    columnGap: computed.columnGap,
    rowGap: computed.rowGap,
    gridTemplateColumns: computed.gridTemplateColumns,
    width: computed.width,
    maxWidth: computed.maxWidth,
    padding: computed.padding,
    margin: computed.margin,
    fontSize: computed.fontSize,
    fontWeight: computed.fontWeight,
    lineHeight: computed.lineHeight,
    letterSpacing: computed.letterSpacing,
    textAlign: computed.textAlign
    // تم حذف color و background لمنع مشاكل التضارب مع الـ Theme
  };
};

export const generateTwoColumnIntroPreset = (semanticResult: any): Block => {
  const payload = semanticResult?.payload || semanticResult;
  const sourceElement = semanticResult?.claimedNode?.element as HTMLElement | undefined;
  const columns = Array.isArray(payload.columns) ? payload.columns : [];
  
  const sourceStyle = getDesktopStyle(sourceElement);
  const sourceColumns = sourceElement ? Array.from(sourceElement.children) as HTMLElement[] : [];
  const id = crypto.randomUUID();

  return {
    id: `two-column-intro-${id}`,
    type: "section",
    meta: { semanticType: "TWO_COLUMN_INTRO" },
    data: {
      props: {},
      style: {
        desktop: {
          padding: "40px 24px"
          // تم حذف backgroundColor: "transparent"
        },
        tablet: {},
        mobile: {}
      }
    },
    children: [
      {
        id: `two-column-flex-${id}`,
        type: "flex",
        data: {
          props: {},
          style: {
            desktop: {
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: sourceStyle.gap || sourceStyle.columnGap || "48px",
              width: "100%",
              maxWidth: sourceStyle.width && sourceStyle.width !== "auto" ? sourceStyle.width : "1180px",
              marginLeft: "auto",
              marginRight: "auto"
            },
            tablet: { flexDirection: "column" },
            mobile: { flexDirection: "column" }
          }
        },
        children: columns.map((column: any, index: number) => {
          const sourceColumn = sourceColumns[index];
          const titleElement = sourceColumn?.querySelector("h1,h2,h3") as HTMLElement | null;
          const textElement = sourceColumn?.querySelector("p") as HTMLElement | null;

          const titleStyle = getDesktopStyle(titleElement);
          const textStyle = getDesktopStyle(textElement);

          return {
            id: `two-column-item-${id}-${index}`,
            type: "flexItem",
            data: {
              props: {},
              style: {
                desktop: {
                  flexGrow: 1,
                  flexBasis: "0",
                  minWidth: "0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px"
                },
                tablet: { width: "100%" },
                mobile: { width: "100%" }
              }
            },
            children: [
              {
                id: `two-column-title-${id}-${index}`,
                type: "title",
                data: {
                  props: { content: column.title || "" },
                  style: {
                    desktop: {
                      fontSize: titleStyle.fontSize || "42px",
                      fontWeight: titleStyle.fontWeight || "700",
                      lineHeight: titleStyle.lineHeight || "1.1",
                      letterSpacing: titleStyle.letterSpacing || "-0.025em"
                    },
                    tablet: {},
                    mobile: {}
                  }
                },
                children: []
              },
              {
                id: `two-column-text-${id}-${index}`,
                type: "text",
                data: {
                  props: { content: column.text || "" },
                  style: {
                    desktop: {
                      fontSize: textStyle.fontSize || "16px",
                      fontWeight: textStyle.fontWeight,
                      lineHeight: textStyle.lineHeight || "1.75",
                      maxWidth: textStyle.maxWidth || "560px"
                    },
                    tablet: {},
                    mobile: {}
                  }
                },
                children: []
              }
            ]
          };
        })
      }
    ]
  };
};