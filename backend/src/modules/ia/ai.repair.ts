import { PageBlock } from "../pages/types/page.types";
import { AiValidationIssue } from "./ai.validator";

const fallbackTextByType = (
  blockType: string,
  pageType: string
): string => {
  if (blockType === "button") {
    return pageType === "contact"
      ? "Contact Us"
      : "Get Started";
  }

  if (blockType === "link") {
    return "Learn More";
  }

  if (blockType === "title") {
    switch (pageType) {
      case "home":
        return "Build Your Digital Presence";
      case "services":
        return "Our Services";
      case "solutions":
        return "Our Solutions";
      case "pricing":
        return "Pricing Plans";
      case "contact":
        return "Contact Us";
      case "about":
        return "About Us";
      default:
        return "Explore Our Platform";
    }
  }

  return "Discover how our solutions help you achieve your goals.";
};

const getTextValue = (
  block: PageBlock
): string => {
  const props = block.data?.props || {};

  return String(
    props.text ||
      props.content ||
      props.label ||
      ""
  ).trim();
};
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
const repairBlock = (
  block: PageBlock,
  pageType: string
): PageBlock => {
  const children =
    Array.isArray(block.children)
      ? block.children.map((child) =>
          repairBlock(child, pageType)
        )
      : [];

if (
  ["title", "text", "button", "link"].includes(block.type) &&
  !isDecorativeIconBlock(block) &&
  getTextValue(block).length < 3
) {
    const fallback =
      fallbackTextByType(block.type, pageType);

    return {
      ...block,
      data: {
        ...block.data,
        props: {
          ...(block.data?.props || {}),
          ...(block.type === "button"
            ? { label: fallback }
            : {}),
          ...(block.type === "link"
            ? { label: fallback }
            : {}),
          ...(block.type === "title"
            ? {
                text: fallback,
                content: fallback
              }
            : {}),
          ...(block.type === "text"
            ? {
                text: fallback,
                content: fallback
              }
            : {})
        }
      },
      children
    };
  }

  return {
    ...block,
    children
  };
};

export const repairAiPageBlocks = (
  pageType: string,
  blocks: PageBlock[],
  issues: AiValidationIssue[]
): PageBlock[] => {
  const hasEmptyTextIssue =
    issues.some(
      (issue) =>
        issue.code === "EMPTY_TEXT_BLOCKS"
    );

  if (!hasEmptyTextIssue) {
    return blocks;
  }

  return blocks.map((block) =>
    repairBlock(block, pageType)
  );
};