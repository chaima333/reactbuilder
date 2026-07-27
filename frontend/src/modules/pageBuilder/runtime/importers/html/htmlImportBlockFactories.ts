import { SerializedBlock } from "./semanticMatchers";
import { extractTypographyStyles } from "../css/extractStyleProps";
import { withDesktopFallback } from "./importHtmlUtils";
import { COMPILER_BLOCK_TYPES } from "./htmlImportConstants";
import { makeShortInlineTextSafe } from "./htmlImportStyleHelpers";

export const createFallbackTextBlock = (
  element: HTMLElement,
  path: (string | number)[],
  content: string
): SerializedBlock => ({
  id: `${COMPILER_BLOCK_TYPES.TEXT}-${path.join("-")}`,
  type: COMPILER_BLOCK_TYPES.TEXT,
  data: {
    props: {
      content
    },
    style: extractTypographyStyles(element)
  },
  children: []
});

export const createFallbackFlexWrapper = (
  path: (string | number)[],
  children: SerializedBlock[],
  style: Record<string, any> = {}
): SerializedBlock => ({
  id: `${COMPILER_BLOCK_TYPES.FLEX}-${path.join("-")}`,
  type: COMPILER_BLOCK_TYPES.FLEX,
  data: {
    props: {},
    style: withDesktopFallback(style, {
      display: "flex",
      flexDirection: "column"
    })
  },
  children: [
    {
      id: `${COMPILER_BLOCK_TYPES.FLEX_ITEM}-${[...path, "item"].join("-")}`,
      type: COMPILER_BLOCK_TYPES.FLEX_ITEM,
      data: {
        props: {},
        style: withDesktopFallback(style, {
          width: "100%"
        })
      },
      children
    }
  ]
});

export const createChoiceControlVisual = (
  element: HTMLInputElement,
  path: (string | number)[]
): SerializedBlock => {
  const computed =
    element.ownerDocument.defaultView?.getComputedStyle(element) || {
      width: "16px",
      color: "",
      fontFamily: "",
      fontSize: "16px"
    } as CSSStyleDeclaration;

  const isRadio = element.type === "radio";
  const marker = isRadio ? (element.checked ? "◉" : "○") : (element.checked ? "☑" : "☐");
  const sourceSize = Number.parseFloat(computed.width || "");
  const size = Number.isFinite(sourceSize) && sourceSize > 0 ? `${Math.min(Math.max(sourceSize, 12), 24)}px` : "16px";

  return {
    id: `${COMPILER_BLOCK_TYPES.TEXT}-${path.join("-")}`,
    type: COMPILER_BLOCK_TYPES.TEXT,
    data: {
      props: {
        content: marker
      },
      style: {
        desktop: {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          flexShrink: 0,
          color: computed.color,
          fontFamily: computed.fontFamily,
          fontSize: size,
          lineHeight: "1",
          boxSizing: "border-box",
          overflow: "visible"
        },
        tablet: {
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          flexShrink: 0
        },
        mobile: {
          width: size,
          minWidth: size,
          maxWidth: size,
          height: size,
          flexShrink: 0
        }
      }
    },
    children: []
  };
};

export const createVisualFormControl = (
  element: HTMLElement,
  path: (string | number)[],
  displayText = ""
): SerializedBlock => {
  const computed =
    element.ownerDocument.defaultView?.getComputedStyle(element) || ({} as CSSStyleDeclaration);
  const visualStyle = {
    desktop: {
      ...(extractTypographyStyles(element).desktop || {}),
      ...(extractTypographyStyles(element).desktop || {})
    },
    tablet: {
      ...(extractTypographyStyles(element).tablet || {})
    },
    mobile: {
      ...(extractTypographyStyles(element).mobile || {})
    }
  };

  return {
    id: `${COMPILER_BLOCK_TYPES.FLEX}-${path.join("-")}`,
    type: COMPILER_BLOCK_TYPES.FLEX,
    data: {
      props: {
        semantic: {
          semanticIntent: "FORM_CONTROL_VISUAL"
        }
      },
      style: {
        ...visualStyle,
        desktop: {
          ...(visualStyle.desktop || {}),
          display: "flex",
          alignItems: "center",
          width: visualStyle.desktop?.width || "100%",
          maxWidth: visualStyle.desktop?.maxWidth || "100%",
          minWidth: "0",
          boxSizing: "border-box",
          overflow: "hidden"
        },
        tablet: {
          ...(visualStyle.tablet || {}),
          width: "100%",
          maxWidth: "100%",
          minWidth: "0",
          boxSizing: "border-box"
        },
        mobile: {
          ...(visualStyle.mobile || {}),
          width: "100%",
          maxWidth: "100%",
          minWidth: "0",
          boxSizing: "border-box"
        }
      }
    },
    children: displayText
      ? [
          {
            id: `${COMPILER_BLOCK_TYPES.TEXT}-${[...path, "value"].join("-")}`,
            type: COMPILER_BLOCK_TYPES.TEXT,
            data: {
              props: {
                content: displayText
              },
              style: extractTypographyStyles(element)
            },
            children: []
          }
        ]
      : []
  };
};

export const createImportedBadgeBlock = (
  element: HTMLElement,
  path: (string | number)[]
): SerializedBlock => {
  const computed =
    element.ownerDocument.defaultView?.getComputedStyle(element) || ({} as CSSStyleDeclaration);
  const visualStyle = {
    desktop: {
      ...(extractTypographyStyles(element).desktop || {})
    },
    tablet: {
      ...(extractTypographyStyles(element).tablet || {})
    },
    mobile: {
      ...(extractTypographyStyles(element).mobile || {})
    }
  };
  const content = (element.textContent || "").trim();

  return {
    id: `${COMPILER_BLOCK_TYPES.TEXT}-${path.join("-")}`,
    type: COMPILER_BLOCK_TYPES.TEXT,
    meta: {
      importSource: "html",
      semanticType: "IMPORTED_BADGE"
    },
    data: {
      props: {
        content,
        semanticRole: "badge",
        variant: "badge"
      },
      style: makeShortInlineTextSafe({
        ...visualStyle,
        desktop: {
          ...(visualStyle.desktop || {}),
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: computed.width || visualStyle.desktop?.width || "max-content",
          minWidth: computed.minWidth || visualStyle.desktop?.minWidth || "max-content",
          height: computed.height || visualStyle.desktop?.height,
          padding: computed.padding || visualStyle.desktop?.padding,
          border: computed.border || visualStyle.desktop?.border,
          borderRadius: computed.borderRadius || visualStyle.desktop?.borderRadius,
          background: computed.background || visualStyle.desktop?.background,
          backgroundColor: computed.backgroundColor || visualStyle.desktop?.backgroundColor,
          color: computed.color || visualStyle.desktop?.color,
          fontFamily: computed.fontFamily || visualStyle.desktop?.fontFamily,
          fontSize: computed.fontSize || visualStyle.desktop?.fontSize,
          fontWeight: computed.fontWeight || visualStyle.desktop?.fontWeight,
          lineHeight: computed.lineHeight || "1",
          boxSizing: "border-box",
          flexShrink: 0
        }
      })
    },
    children: []
  };
};
