import { PageBlock } from "../pages/types/page.types";

export type AiValidationSeverity =
  | "info"
  | "warning"
  | "error";

export type AiValidationIssue = {
  code: string;
  severity: AiValidationSeverity;
  message: string;
  blockId?: string;
  pageType?: string;
};

export type AiValidationResult = {
  valid: boolean;
  score: number;
  issues: AiValidationIssue[];
};

const getChildren = (
  block: PageBlock
): PageBlock[] =>
  Array.isArray(block.children)
    ? block.children
    : [];

const walkBlocks = (
  blocks: PageBlock[]
): PageBlock[] => {
  const result: PageBlock[] = [];

  const visit = (
    block: PageBlock
  ) => {
    result.push(block);

    getChildren(block).forEach(visit);
  };

  blocks.forEach(visit);

  return result;
};

const getBlockText = (
  block: PageBlock
): string => {
  const props =
    block.data?.props || {};

  return String(
    props.text ||
      props.content ||
      props.label ||
      props.title ||
      ""
  ).trim();
};

const hasMeaningfulText = (
  block: PageBlock
): boolean =>
  getBlockText(block).length >= 3;

const hasResponsiveStyle = (
  block: PageBlock
): boolean => {
  const style =
    block.data?.style;

  return Boolean(
    style &&
      typeof style === "object" &&
      "desktop" in style &&
      "tablet" in style &&
      "mobile" in style
  );
};

const countByType = (
  blocks: PageBlock[],
  type: string
): number =>
  blocks.filter(
    (block) => block.type === type
  ).length;

const findFirstByIdPrefix = (
  blocks: PageBlock[],
  prefix: string
): PageBlock | undefined =>
  blocks.find(
    (block) =>
      typeof block.id === "string" &&
      block.id.startsWith(prefix)
  );

const hasBlockByType = (
  blocks: PageBlock[],
  type: string
): boolean =>
  blocks.some(
    (block) => block.type === type
  );

const pushIssue = (
  issues: AiValidationIssue[],
  issue: AiValidationIssue
) => {
  issues.push(issue);
};

const computeScore = (
  issues: AiValidationIssue[]
): number => {
  const penalty =
    issues.reduce(
      (total, issue) => {
        if (issue.severity === "error") {
          return total + 20;
        }

        if (issue.severity === "warning") {
          return total + 8;
        }

        return total + 3;
      },
      0
    );

  return Math.max(
    0,
    100 - penalty
  );
};

export const validateAiPageBlocks = (
  pageType: string,
  blocks: PageBlock[],
  prompt: string = ""
): AiValidationResult => {

  const issues: AiValidationIssue[] = [];
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return {
      valid: false,
      score: 0,
      issues: [
        {
          code: "EMPTY_PAGE",
          severity: "error",
          pageType,
          message:
            "Generated page has no blocks."
        }
      ]
    };
  }

  const flatBlocks = walkBlocks(blocks);
  const navbarCount =
  countByType(blocks, "navbar");

const footerCount =
  countByType(blocks, "footer");

const sectionCount =
  countByType(blocks, "section");

const titleCount =
  countByType(flatBlocks, "title");

const textCount =
  countByType(flatBlocks, "text");

const inputCount =
  countByType(flatBlocks, "input") +
  countByType(flatBlocks, "textarea");
const promptText =
  prompt.toLowerCase();

const promptNeedsStats =
  [
    "statistics",
    "stats",
    "numbers",
    "metrics",
    "kpi",
    "impact",
    "success rate",
    "uptime",
    "rating"
  ].some((keyword) =>
    promptText.includes(keyword)
  );

const promptNeedsPricing =
  [
    "pricing",
    "price",
    "plans",
    "subscription",
    "packages"
  ].some((keyword) =>
    promptText.includes(keyword)
  );

const promptNeedsFaq =
  [
    "faq",
    "frequently asked",
    "questions"
  ].some((keyword) =>
    promptText.includes(keyword)
  );

const promptNeedsContact =
  [
    "contact",
    "consultation",
    "booking",
    "appointment"
  ].some((keyword) =>
    promptText.includes(keyword)
  );

const hasStats =
  flatBlocks.some((block) =>
    String(block.id || "")
      .toLowerCase()
      .includes("stats")
  );

const hasPricing =
  flatBlocks.some((block) =>
    String(block.id || "")
      .toLowerCase()
      .includes("pricing")
  );

const hasFaq =
  flatBlocks.some((block) =>
    String(block.id || "")
      .toLowerCase()
      .includes("faq")
  );

const hasContact =
  flatBlocks.some((block) =>
    String(block.id || "")
      .toLowerCase()
      .includes("contact")
  ) || inputCount >= 3;

  if (
  promptNeedsStats &&
  pageType === "home" &&
  !hasStats
) {
  pushIssue(issues, {
    code: "PROMPT_STATS_NOT_SATISFIED",
    severity: "warning",
    pageType,
    message:
      "Prompt asks for statistics or metrics, but no stats section was detected."
  });
}

if (
  promptNeedsPricing &&
  pageType === "pricing" &&
  !hasPricing
) {
  pushIssue(issues, {
    code: "PROMPT_PRICING_NOT_SATISFIED",
    severity: "warning",
    pageType,
    message:
      "Prompt asks for pricing, but no pricing section was detected."
  });
}

if (
  promptNeedsFaq &&
  !hasFaq &&
  ["home", "services", "pricing"].includes(pageType)
) {
  pushIssue(issues, {
    code: "PROMPT_FAQ_NOT_SATISFIED",
    severity: "warning",
    pageType,
    message:
      "Prompt asks for FAQ, but no FAQ section was detected."
  });
}

if (
  promptNeedsContact &&
  pageType === "contact" &&
  !hasContact
) {
  pushIssue(issues, {
    code: "PROMPT_CONTACT_NOT_SATISFIED",
    severity: "warning",
    pageType,
    message:
      "Prompt asks for contact or consultation, but no contact form was detected."
  });
}

  if (navbarCount === 0) {
    pushIssue(issues, {
      code: "MISSING_NAVBAR",
      severity: "error",
      pageType,
      message:
        "Generated page is missing a navbar."
    });
  }

  if (navbarCount > 1) {
    pushIssue(issues, {
      code: "MULTIPLE_NAVBARS",
      severity: "warning",
      pageType,
      message:
        "Generated page contains more than one navbar."
    });
  }

  if (footerCount === 0) {
    pushIssue(issues, {
      code: "MISSING_FOOTER",
      severity: "error",
      pageType,
      message:
        "Generated page is missing a footer."
    });
  }

  if (footerCount > 1) {
    pushIssue(issues, {
      code: "MULTIPLE_FOOTERS",
      severity: "warning",
      pageType,
      message:
        "Generated page contains more than one footer."
    });
  }

  if (sectionCount === 0) {
    pushIssue(issues, {
      code: "NO_SECTIONS",
      severity: "error",
      pageType,
      message:
        "Generated page has no content sections."
    });
  }

  if (titleCount === 0) {
    pushIssue(issues, {
      code: "NO_TITLES",
      severity: "warning",
      pageType,
      message:
        "Generated page has no title blocks."
    });
  }

  if (textCount === 0) {
    pushIssue(issues, {
      code: "NO_TEXT",
      severity: "warning",
      pageType,
      message:
        "Generated page has no text blocks."
    });
  }

  const heroBlock =
    findFirstByIdPrefix(
      flatBlocks,
      "hero-section"
    );

  if (
    ["home", "services", "solutions", "pricing", "integrations", "reservation"].includes(
      pageType
    ) &&
    !heroBlock
  ) {
    pushIssue(issues, {
      code: "MISSING_HERO",
      severity: "warning",
      pageType,
      message:
        "Page should contain a hero section."
    });
  }

  if (heroBlock) {
    const heroChildren =
      walkBlocks([heroBlock]);

    const heroHasTitle =
      heroChildren.some(
        (block) =>
          block.type === "title" &&
          hasMeaningfulText(block)
      );

    const heroHasText =
      heroChildren.some(
        (block) =>
          block.type === "text" &&
          hasMeaningfulText(block)
      );

    const heroHasCta =
      heroChildren.some(
        (block) =>
          block.type === "button" &&
          hasMeaningfulText(block)
      );

    if (!heroHasTitle) {
      pushIssue(issues, {
        code: "HERO_MISSING_TITLE",
        severity: "error",
        pageType,
        blockId: heroBlock.id,
        message:
          "Hero section is missing a meaningful title."
      });
    }

    if (!heroHasText) {
      pushIssue(issues, {
        code: "HERO_MISSING_TEXT",
        severity: "warning",
        pageType,
        blockId: heroBlock.id,
        message:
          "Hero section is missing descriptive text."
      });
    }

    if (
      pageType === "home" &&
      !heroHasCta
    ) {
      pushIssue(issues, {
        code: "HERO_MISSING_CTA",
        severity: "warning",
        pageType,
        blockId: heroBlock.id,
        message:
          "Home hero should include a call-to-action button."
      });
    }
  }

  if (
    pageType === "services"
  ) {
    const serviceCards =
      flatBlocks.filter(
        (block) =>
          typeof block.id === "string" &&
          block.id.includes("service")
      );

    if (serviceCards.length < 3) {
      pushIssue(issues, {
        code: "SERVICES_TOO_FEW_ITEMS",
        severity: "warning",
        pageType,
        message:
          "Services page should contain at least three service-related blocks."
      });
    }
  }

  if (
    pageType === "contact" &&
    inputCount < 3
  ) {
    pushIssue(issues, {
      code: "CONTACT_FORM_WEAK",
      severity: "warning",
      pageType,
      message:
        "Contact page should contain a stronger contact form."
    });
  }
const isDecorativeIconBlock = (
  block: PageBlock
): boolean => {
  const id =
    String(block.id || "").toLowerCase();

  return (
    id.includes("icon") ||
    id.includes("avatar") ||
    id.includes("logo") ||
    id.includes("stars")
  );
};
const emptyTextBlocks =
  flatBlocks.filter(
    (block) =>
      ["title", "text", "button", "link"].includes(
        block.type
      ) &&
      !isDecorativeIconBlock(block) &&
      !hasMeaningfulText(block)
  );

if (emptyTextBlocks.length > 0) {
  pushIssue(issues, {
    code: "EMPTY_TEXT_BLOCKS",
    severity: "warning",
    pageType,
    message:
      `${emptyTextBlocks.length} text-like blocks are empty or too short.`,
    blockId:
      emptyTextBlocks
        .slice(0, 5)
        .map((block) => block.id)
        .join(", ")
  });
}

  const missingResponsive =
    flatBlocks.filter(
      (block) =>
        block.data?.style &&
        !hasResponsiveStyle(block)
    );

  if (missingResponsive.length > 0) {
    pushIssue(issues, {
      code: "RESPONSIVE_STYLE_INCOMPLETE",
      severity: "info",
      pageType,
      message:
        `${missingResponsive.length} blocks have incomplete responsive styles.`
    });
  }

  const score =
    computeScore(issues);

  return {
    valid:
      !issues.some(
        (issue) =>
          issue.severity === "error"
      ),
    score,
    issues
  };
};