import { PageBlock } from "../../pages/types/page.types";
import { DesignAction } from "./designCopilot.types";

const isResponsiveStyle = (
  style: any
): boolean =>
  !!style &&
  typeof style === "object" &&
  (
    style.desktop ||
    style.tablet ||
    style.mobile
  );

const ensureResponsiveStyle = (
  style: any
) => {
  if (isResponsiveStyle(style)) {
    return {
      desktop: {
        ...(style.desktop || {})
      },
      tablet: {
        ...(style.tablet || {})
      },
      mobile: {
        ...(style.mobile || {})
      }
    };
  }

  return {
    desktop: {
      ...(style || {})
    },
    tablet: {},
    mobile: {}
  };
};

const blockText = (
  block: PageBlock
): string => {
  const props =
    block.data?.props || {};

  return JSON.stringify({
    id: block.id,
    type: block.type,
    text: props.text,
    content: props.content,
    label: props.label,
    title: props.title,
    children: block.children
  }).toLowerCase();
};

const matchesTarget = (
  block: PageBlock,
  target?: string
): boolean => {
  if (
    !target ||
    target === "page"
  ) {
    return true;
  }

  return blockText(block).includes(
    target.toLowerCase()
  );
};

const looksLikeCard = (
  block: PageBlock
): boolean => {
  const text =
    blockText(block);

  const id =
    String(block.id || "").toLowerCase();

  return (
    id.includes("card") ||
    id.includes("service") ||
    id.includes("feature") ||
    id.includes("testimonial") ||
    id.includes("faq") ||
    id.includes("contact") ||
    id.includes("pricing") ||
    id.includes("reservation") ||
    text.includes("card") ||
    text.includes("services") ||
    text.includes("frequently asked") ||
    text.includes("get in touch")
  );
};
const looksLikeStatsBlock = (
  block: PageBlock
): boolean => {
  const text =
    blockText(block);

  const id =
    String(block.id || "").toLowerCase();

  return (
    id.includes("stat") ||
    id.includes("impact") ||
    text.includes("our impact") ||
    text.includes("impact") ||
    text.includes("stats") ||
    text.includes("1000") ||
    text.includes("98%") ||
    text.includes("200+") ||
    text.includes("4.9")
  );
};
const applyActionToBlock = (
  block: PageBlock,
  action: DesignAction
): PageBlock => {
  const style =
    ensureResponsiveStyle(
      block.data?.style || {}
    );

  const desktop =
    style.desktop;

  const tablet =
    style.tablet;

  const mobile =
    style.mobile;

  const targetMatches =
    matchesTarget(
      block,
      action.target
    );

  if (
    action.type === "CENTER_LAYOUT" &&
    targetMatches
  ) {
    if (
      block.type === "section" ||
      block.type === "flex" ||
      block.type === "grid" ||
      block.type === "flexItem" ||
      block.type === "gridItem"
    ) {
      desktop.width =
        "100%";

      desktop.maxWidth =
        desktop.maxWidth || "1180px";

      desktop.margin =
        "0 auto";

      desktop.boxSizing =
        "border-box";

      if (
        block.type === "section" ||
        block.type === "flex"
      ) {
        desktop.display =
          desktop.display || "flex";

        desktop.justifyContent =
          "center";

        desktop.alignItems =
          "center";
      }
    }
  }

  if (
    action.type === "IMPROVE_SPACING" &&
    targetMatches
  ) {
    if (
      block.type === "section" ||
      block.type === "footer"
    ) {
      desktop.padding =
        "96px 40px";

      tablet.padding =
        "72px 28px";

      mobile.padding =
        "56px 18px";

      desktop.boxSizing =
        "border-box";
    }

    if (
      block.type === "grid" ||
      block.type === "flex"
    ) {
      desktop.gap =
        desktop.gap || "28px";

      tablet.gap =
        tablet.gap || "22px";

      mobile.gap =
        mobile.gap || "18px";
    }
  }

  if (
    action.type === "IMPROVE_CARDS" &&
    looksLikeCard(block)
  ) {
    if (
      block.type !== "button" &&
      block.type !== "image" &&
      block.type !== "input" &&
      block.type !== "textarea"
    ) {
      desktop.borderRadius =
        desktop.borderRadius || "22px";

      tablet.borderRadius =
        tablet.borderRadius || "20px";

      mobile.borderRadius =
        mobile.borderRadius || "18px";

      desktop.boxShadow =
        desktop.boxShadow ||
        "0 18px 45px rgba(15,23,42,0.10)";

      desktop.border =
        desktop.border || "1px solid #e5e7eb";

      if (
        !desktop.padding ||
        desktop.padding === "0"
      ) {
        desktop.padding =
          "28px";
      }

      desktop.boxSizing =
        "border-box";
    }
  }

  if (
    action.type === "IMPROVE_BUTTONS" &&
    block.type === "button"
  ) {
    desktop.borderRadius =
      "14px";

    tablet.borderRadius =
      "14px";

    mobile.borderRadius =
      "14px";

    desktop.fontWeight =
      "800";

    desktop.boxShadow =
      "0 12px 28px rgba(37,99,235,0.24)";
  }

  if (
    action.type === "IMPROVE_IMAGES" &&
    block.type === "image"
  ) {
    desktop.borderRadius =
      "24px";

    tablet.borderRadius =
      "22px";

    mobile.borderRadius =
      "18px";

    desktop.boxShadow =
      "0 18px 45px rgba(15,23,42,0.12)";
  }

  if (
    action.type === "IMPROVE_FORMS" &&
    (
      block.type === "input" ||
      block.type === "textarea"
    )
  ) {
    desktop.borderRadius =
      "14px";

    tablet.borderRadius =
      "14px";

    mobile.borderRadius =
      "14px";

    desktop.minHeight =
      block.type === "textarea"
        ? "130px"
        : "52px";

    desktop.boxShadow =
      "0 8px 22px rgba(15,23,42,0.06)";

    desktop.border =
      desktop.border || "1px solid #cbd5e1";

    desktop.boxSizing =
      "border-box";
  }
if (
  action.type === "IMPROVE_STATS" &&
  looksLikeStatsBlock(block)
) {
  if (
    block.type === "section"
  ) {
    desktop.display =
      "flex";

    desktop.flexDirection =
      "column";

    desktop.alignItems =
      "center";

    desktop.justifyContent =
      "center";

    desktop.width =
      "100%";

    desktop.padding =
      desktop.padding || "88px 40px";

    desktop.boxSizing =
      "border-box";
  }

  if (
    block.type === "grid"
  ) {
    desktop.display =
      "grid";

    desktop.gridTemplateColumns =
      "repeat(4, minmax(150px, 1fr))";

    desktop.gap =
      "22px";

    desktop.width =
      "100%";

    desktop.maxWidth =
      "900px";

    desktop.margin =
      "0 auto";

    tablet.gridTemplateColumns =
      "repeat(2, minmax(140px, 1fr))";

    mobile.gridTemplateColumns =
      "1fr";
  }

  if (
    block.type === "flex"
  ) {
    desktop.display =
      "flex";

    desktop.flexDirection =
      desktop.flexDirection || "row";

    desktop.flexWrap =
      "wrap";

    desktop.justifyContent =
      "center";

    desktop.alignItems =
      "stretch";

    desktop.gap =
      "22px";

    desktop.width =
      "100%";

    desktop.maxWidth =
      desktop.maxWidth || "900px";

    desktop.margin =
      "0 auto";
  }

  if (
    block.type === "flexItem" ||
    block.type === "gridItem"
  ) {
    desktop.flex =
      "1 1 150px";

    desktop.minWidth =
      "150px";

    desktop.maxWidth =
      "220px";

    desktop.width =
      "100%";

    desktop.boxSizing =
      "border-box";
  }

  if (
    (
      block.type === "flex" ||
      block.type === "gridItem" ||
      block.type === "flexItem"
    ) &&
    blockText(block).match(/\d/)
  ) {
    desktop.borderRadius =
      "22px";

    desktop.boxShadow =
      "0 18px 45px rgba(15,23,42,0.12)";

    desktop.border =
      desktop.border || "1px solid #e5e7eb";

    desktop.backgroundColor =
      desktop.backgroundColor || "#ffffff";

    desktop.padding =
      desktop.padding || "26px 22px";

    desktop.textAlign =
      "center";

    desktop.boxSizing =
      "border-box";
  }

  if (
    block.type === "text" ||
    block.type === "title"
  ) {
    desktop.textAlign =
      "center";

    if (
      blockText(block).match(/\d/)
    ) {
      desktop.fontSize =
        "36px";

      desktop.fontWeight =
        "900";

      desktop.lineHeight =
        "1.05";

      desktop.color =
        desktop.color || "#0e224e";

      desktop.whiteSpace =
        "nowrap";

      desktop.wordBreak =
        "keep-all";
    }
  }
}
  return {
    ...block,
    data: {
      ...(block.data || {}),
      style
    },
    children:
      block.children?.map((child) =>
        applyActionToBlock(
          child,
          action
        )
      ) || []
  };
};

export const applyDesignActions = (
  blocks: PageBlock[],
  actions: DesignAction[]
): PageBlock[] =>
  actions.reduce(
    (
      currentBlocks,
      action
    ) =>
      currentBlocks.map((block) =>
        applyActionToBlock(
          block,
          action
        )
      ),
    blocks
  );