// ai.builder.ts — البنّاء الوحيد

import { PageBlock } from "../pages/types/page.types";
import { GeneratedPage } from "./ai.types";
import { CATEGORY_TEMPLATES, SectionConfig } from "./ai.templates";

const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const responsiveStyle = (desktop: Record<string, unknown> = {}) => ({
  desktop,
  tablet: {},
  mobile: {}
});

// ---- Block primitives ----

const titleBlock = (text: string, fontSize = "44px"): PageBlock => ({
  id: makeId("title"),
  type: "title",
  data: {
    props: { content: text, text },
    style: responsiveStyle({ fontSize, fontWeight: "800", textAlign: "center", marginBottom: "16px" })
  },
  children: []
});

const textBlock = (text: string): PageBlock => ({
  id: makeId("text"),
  type: "text",
  data: {
    props: { text },
    style: responsiveStyle({ fontSize: "18px", textAlign: "center", marginBottom: "24px" })
  },
  children: []
});

const buttonBlock = (label: string): PageBlock => ({
  id: makeId("button"),
  type: "button",
  data: {
    props: { label },
    style: responsiveStyle({ display: "block", margin: "0 auto" })
  },
  children: []
});

const flexItemBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("flex-item"),
  type: "flexItem",
  data: { props: {}, style: responsiveStyle({ width: "100%" }) },
  children
});

const flexBlock = (children: PageBlock[]): PageBlock => ({
  id: makeId("flex"),
  type: "flex",
  data: {
    props: {},
    style: responsiveStyle({
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "16px", width: "100%"
    })
  },
  children
});

const sectionBlock = (children: PageBlock[], sectionStyle: Record<string, unknown> = {}): PageBlock => ({
  id: makeId("section"),
  type: "section",
  data: {
    props: {},
    style: responsiveStyle({ padding: "80px 40px", backgroundColor: "#ffffff", ...sectionStyle })
  },
  children: [flexBlock(children.map(child => flexItemBlock([child])))]
});

// ---- Config → Blocks ----

function buildSectionFromConfig(config: SectionConfig): PageBlock {
  const { title, text, cta, style = {} } = config;

  const sectionStyle: Record<string, unknown> = {};
  if (style.backgroundColor) sectionStyle.backgroundColor = style.backgroundColor;
  if (style.color) sectionStyle.color = style.color;

  return sectionBlock(
    [
      titleBlock(title, style.titleSize ?? "44px"),
      textBlock(text),
      buttonBlock(cta)
    ],
    sectionStyle
  );
}

// ---- Public API ----

export function generateTemplate(
  category: string,
  prompt: string,
  title?: string
): GeneratedPage {
  const config = CATEGORY_TEMPLATES[category] ?? CATEGORY_TEMPLATES["Corporate"];

  // Corporate: title و text يأتيان من المستخدم
  const resolvedSections = config.sections.map((section, index) => {
    if (index === 0 && category === "Corporate") {
      return {
        ...section,
        title: title ?? "Corporate Website",
        text: prompt || "A modern corporate platform built for clarity, impact, and growth."
      };
    }
    return section;
  });

  const blocks: PageBlock[] = resolvedSections.map(buildSectionFromConfig);

  return {
    title: title ?? config.defaultTitle,
    blocks
  };
}