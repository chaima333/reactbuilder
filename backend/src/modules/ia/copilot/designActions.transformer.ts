import { DesignAction } from "./designCopilot.types";

type PageBlock = {
  id?: string;
  type?: string;
  data?: {
    props?: Record<string, any>;
    style?: any;
  };
  children?: PageBlock[];
};

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

const ownBlockText = (
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
    title: props.title
  }).toLowerCase();
};

const directChildrenText = (
  block: PageBlock
): string =>
  JSON.stringify(
    (block.children || []).map((child) => ({
      id: child.id,
      type: child.type,
      props: child.data?.props || {}
    }))
  ).toLowerCase();

const blockText = (
  block: PageBlock
): string =>
  JSON.stringify(block || {}).toLowerCase();

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
    text.includes("frequently asked") ||
    text.includes("get in touch")
  );
};

const startsStatsScope = (
  block: PageBlock
): boolean => {
  const own =
    ownBlockText(block);

  const id =
    String(block.id || "").toLowerCase();

  return (
    id.includes("stat") ||
    id.includes("impact") ||
    id.includes("number") ||
    own.includes("our impact") ||
    own.includes("our numbers") ||
    own.includes("stats") ||
    own.includes("key metrics")
  );
};

const hasOwnStatValue = (
  block: PageBlock
): boolean => {
  const own =
    ownBlockText(block);

  return (
    /[0-9]/.test(own) ||
    own.includes("%") ||
    own.includes("+") ||
    own.includes("★") ||
    own.includes("rating")
  );
};

const hasDirectStatValue = (
  block: PageBlock
): boolean => {
  const text =
    `${ownBlockText(block)} ${directChildrenText(block)}`;

  return (
    /[0-9]/.test(text) ||
    text.includes("%") ||
    text.includes("+") ||
    text.includes("★") ||
    text.includes("rating")
  );
};

const applyActionToBlock = (
  block: PageBlock,
  action: DesignAction,
  inStatsScope = false,
  inFooterScope = false,
  inNavbarScope = false
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
    const isImprove = (
  improvement: string
): boolean =>
  action.type === "IMPROVE_DESIGN" &&
  action.improvement === improvement;

 const statsScopeStarts =
  isImprove("IMPROVE_STATS") &&
  startsStatsScope(block);

  const statsScope =
    inStatsScope || statsScopeStarts;

  const footerScopeStarts =
    isImprove("IMPROVE_FOOTER") &&
    (
      block.type === "footer" ||
      String(block.id || "")
        .toLowerCase()
        .includes("footer")
    );

  const footerScope =
    inFooterScope || footerScopeStarts;

  const navbarScopeStarts =
    isImprove("IMPROVE_NAVBAR") &&
    (
      block.type === "navbar" ||
      String(block.id || "")
        .toLowerCase()
        .includes("navbar")
    );

  const navbarScope =
    inNavbarScope || navbarScopeStarts;

  if (
    isImprove("CENTER_LAYOUT")&&
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
    isImprove("IMPROVE_SPACING") &&
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
    isImprove("IMPROVE_CARDS") &&
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
    isImprove("IMPROVE_BUTTONS") &&
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
    isImprove("IMPROVE_IMAGES") &&
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
    isImprove("IMPROVE_FORMS") &&
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
    isImprove("IMPROVE_STATS") &&
    statsScope
  ) {
    if (
      statsScopeStarts &&
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

      desktop.boxSizing =
        "border-box";
    }

    if (
      statsScopeStarts &&
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
        "920px";

      desktop.margin =
        "0 auto";

      tablet.gridTemplateColumns =
        "repeat(2, minmax(140px, 1fr))";

      mobile.gridTemplateColumns =
        "1fr";
    }

    if (
      statsScopeStarts &&
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
        desktop.maxWidth || "920px";

      desktop.margin =
        "0 auto";
    }

    if (
      (
        block.type === "flexItem" ||
        block.type === "gridItem" ||
        block.type === "flex"
      ) &&
      hasDirectStatValue(block)
    ) {
      desktop.minWidth =
        desktop.minWidth || "150px";

      desktop.maxWidth =
        desktop.maxWidth || "230px";

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
      (
        block.type === "text" ||
        block.type === "title"
      ) &&
      hasOwnStatValue(block)
    ) {
      desktop.textAlign =
        "center";

      desktop.fontSize =
        "36px";

      desktop.fontWeight =
        "900";

      desktop.lineHeight =
        "1.05";

      desktop.color =
        desktop.color || "#2563eb";

      desktop.whiteSpace =
        "nowrap";

      desktop.wordBreak =
        "keep-all";
    }
  }

  if (
    isImprove("IMPROVE_NAVBAR") &&
    navbarScope
  ) {
    if (navbarScopeStarts) {
      desktop.display =
        "flex";

      desktop.flexDirection =
        "row";

      desktop.alignItems =
        "center";

      desktop.justifyContent =
        "space-between";

      desktop.gap =
        "28px";

      desktop.width =
        "100%";

      desktop.minHeight =
        "82px";

      desktop.padding =
        "18px 56px";

      desktop.backgroundColor =
        "#ffffff";

      desktop.boxShadow =
        "0 12px 35px rgba(15,23,42,0.08)";

      desktop.borderBottom =
        "1px solid #e5e7eb";

      desktop.boxSizing =
        "border-box";

      tablet.padding =
        "16px 32px";

      mobile.flexDirection =
        "column";

      mobile.alignItems =
        "center";

      mobile.justifyContent =
        "center";

      mobile.gap =
        "16px";

      mobile.padding =
        "18px";
    }

    if (
      block.type === "flex" ||
      block.type === "grid"
    ) {
      desktop.display =
        "flex";

      desktop.flexDirection =
        "row";

      desktop.alignItems =
        "center";

      desktop.justifyContent =
        desktop.justifyContent || "center";

      desktop.flexWrap =
        "nowrap";

      desktop.gap =
        desktop.gap || "24px";

      desktop.width =
        desktop.width || "auto";

      desktop.maxWidth =
        "none";

      desktop.margin =
        "0";

      desktop.boxSizing =
        "border-box";
    }

    if (
      block.type === "flexItem" ||
      block.type === "gridItem"
    ) {
      desktop.display =
        desktop.display || "flex";

      desktop.alignItems =
        "center";

      desktop.justifyContent =
        "center";

      desktop.width =
        "auto";

      desktop.maxWidth =
        "none";

      desktop.margin =
        "0";

      desktop.padding =
        desktop.padding || "0";

      desktop.boxSizing =
        "border-box";
        desktop.background =
  "transparent";

desktop.backgroundColor =
  "transparent";

desktop.boxShadow =
  "none";

desktop.border =
  "none";

desktop.minHeight =
  "auto";

desktop.height =
  "auto";

desktop.padding =
  "0";

desktop.borderRadius =
  "0";
    }

    if (
      block.type === "text" ||
      block.type === "title"
    ) {
      desktop.whiteSpace =
        "nowrap";

      desktop.textAlign =
        "center";

      desktop.margin =
        "0";

      desktop.color =
        desktop.color || "#0f172a";

      desktop.fontWeight =
        desktop.fontWeight || "800";
        desktop.background =
  "transparent";

desktop.backgroundColor =
  "transparent";

desktop.boxShadow =
  "none";

desktop.border =
  "none";

desktop.padding =
  "0";
    }

    if (
      block.type === "button"
    ) {
      desktop.whiteSpace =
        "nowrap";

      desktop.borderRadius =
        "14px";

      desktop.padding =
        "12px 24px";

      desktop.fontWeight =
        "800";

      desktop.backgroundColor =
        desktop.backgroundColor || "#2563eb";

      desktop.color =
        "#ffffff";

      desktop.boxShadow =
        "0 12px 28px rgba(37,99,235,0.24)";
    }
  }

 if (
  isImprove("IMPROVE_FOOTER") &&
  footerScope
) {
  if (footerScopeStarts) {
    desktop.backgroundColor =
      "#020617";

    desktop.color =
      "#e5e7eb";

    desktop.padding =
      "48px 56px 24px";

    desktop.width =
      "100%";

    desktop.boxSizing =
      "border-box";

    desktop.display =
      "block";

    tablet.padding =
      "40px 32px 22px";

    mobile.padding =
      "36px 20px 20px";
  }

  if (
    block.type === "flex" ||
    block.type === "grid"
  ) {
    desktop.gap =
      desktop.gap || "28px";

    desktop.alignItems =
      desktop.alignItems || "flex-start";

    desktop.justifyContent =
      desktop.justifyContent || "space-between";

    desktop.width =
      desktop.width || "100%";

    desktop.boxSizing =
      "border-box";
  }

  if (
    block.type === "flexItem" ||
    block.type === "gridItem"
  ) {
    desktop.boxSizing =
      "border-box";

    desktop.minWidth =
      desktop.minWidth || "160px";
  }

  if (
    block.type === "text" ||
    block.type === "title" ||
    block.type === "link"
  ) {
    desktop.color =
      block.type === "title"
        ? "#ffffff"
        : "#cbd5e1";

    desktop.margin =
      desktop.margin || "0";

    desktop.lineHeight =
      desktop.lineHeight || "1.7";

    desktop.textDecoration =
      "none";
  }

  if (
    block.type === "button"
  ) {
    desktop.borderRadius =
      "14px";

    desktop.padding =
      "12px 22px";

    desktop.fontWeight =
      "800";

    desktop.backgroundColor =
      desktop.backgroundColor || "#2563eb";

    desktop.color =
      "#ffffff";

    desktop.boxShadow =
      "0 12px 28px rgba(37,99,235,0.24)";
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
      action,
      statsScope,
      footerScope,
      navbarScope
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