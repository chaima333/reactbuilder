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