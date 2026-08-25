import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  Chip,
  CircularProgress,
  Snackbar,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  DesignServices as DesignServicesIcon,
  Edit as EditIcon,
  QuestionAnswer as QuestionAnswerIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

import { findHeroBlock, findBlock } from "./blockFinders";
import {
  getConversationalAssistantMessage,
  isObviousConversationalPrompt
} from "./assistantIntent";
import { generateCTAPreset } from "../../presets/generateCTAPreset";
import AiActivityHistoryPanel from "../../components/AiActivityHistoryPanel";
import { normalizeCanonicalContainers } from "../../runtime/normalize/normalizeCanonicalContainers";

// ============================================
// TYPES
// ============================================

export type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  action:
    | "IMPROVE_HERO"
    | "ADD_SERVICES"
    | "ADD_FAQ"
    | "ADD_CTA"
    | "ADD_TESTIMONIALS"
    | "ADD_PRICING";
  payload?: any;
};

export type AssistantResponse = {
  kind?: "message" | "clarification" | "suggestions" | "action";
  intent?: string;
  message?: string;
  reply: string;
  category: string;
  suggestions?: AssistantSuggestion[];
};

// ============================================
// PROPS
// ============================================

interface AssistantPanelProps {
  siteId?: string | number;
  pageId?: string | number;
  blocks: any[];
  pageTitle: string;
  slug: string;
  hasGlobalNavbar: boolean;
  hasGlobalFooter: boolean;
  selectedBlockId?: string | null;
  actions: {
    setBlocks: (blocks: any[]) => void;
    updateBlock: (id: string, updates: any) => void;
  };
  setPageTitle: (title: string) => void;
  setSelectedBlockId: (id: string | null) => void;
  onNavigate?: (path: string) => void;
  generateAiPage: (params: any) => any;
  askAssistant: (params: any) => any;
  editSelectedBlock: (params: any) => any;
  hydrateBlocks: (blocks: any[]) => any[];
  // Design Co-Pilot hooks
  designCopilotChat?: (params: any) => any;
  designCopilotApply?: (params: any) => any;
}

// ============================================
// BLOCK HELPERS
// ============================================

const makeAssistantId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const responsiveStyle = (
  desktop: Record<string, any> = {},
  tablet: Record<string, any> = {},
  mobile: Record<string, any> = {}
) => ({
  desktop,
  tablet,
  mobile,
});

const titleBlock = (text: string, style: Record<string, any> = {}): any => ({
  id: makeAssistantId("assistant-title"),
  type: "title",
  data: {
    props: {
      content: text,
      text,
    },
    style: responsiveStyle(
      {
        fontSize: "38px",
        fontWeight: "900",
        textAlign: "center",
        marginBottom: "16px",
        color: "#0f172a",
        ...style,
      },
      { fontSize: "32px" },
      { fontSize: "28px" }
    ),
  },
  children: [],
});

const textBlock = (text: string, style: Record<string, any> = {}): any => ({
  id: makeAssistantId("assistant-text"),
  type: "text",
  data: {
    props: {
      text,
      content: text,
    },
    style: responsiveStyle(
      {
        fontSize: "16px",
        color: "#64748b",
        lineHeight: "1.7",
        textAlign: "center",
        marginBottom: "0",
        ...style,
      },
      { fontSize: "15px" },
      { fontSize: "14px" }
    ),
  },
  children: [],
});

const buttonBlock = (label: string, href: string = "#"): any => ({
  id: makeAssistantId("assistant-button"),
  type: "button",
  data: {
    props: {
      label,
      href,
      useTheme: true,
      variant: "contained",
    },
    style: responsiveStyle(
      {
        display: "inline-block",
        padding: "12px 28px",
        fontSize: "15px",
        fontWeight: "800",
        cursor: "pointer",
        textAlign: "center",
      },
      { fontSize: "14px" },
      { fontSize: "14px", padding: "10px 22px" }
    ),
  },
  children: [],
});

const gridItemBlock = (children: any[]): any => ({
  id: makeAssistantId("assistant-grid-item"),
  type: "gridItem",
  data: {
    props: {},
    style: responsiveStyle({}),
  },
  children,
});

const flexItemBlock = (children: any[]): any => ({
  id: makeAssistantId("assistant-flex-item"),
  type: "flexItem",
  data: {
    props: {},
    style: responsiveStyle({
      width: "100%",
    }),
  },
  children,
});

const sectionBlock = (children: any[], style: Record<string, any> = {}): any => ({
  id: makeAssistantId("assistant-section"),
  type: "section",
  data: {
    props: {},
    style: responsiveStyle(
      {
        padding: "80px 40px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box",
        ...style,
      },
      { padding: "64px 28px" },
      { padding: "48px 18px" }
    ),
  },
  children: [
    {
      id: makeAssistantId("assistant-section-flex"),
      type: "flex",
      data: {
        props: {},
        style: responsiveStyle(
          {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            width: "100%",
            maxWidth: "100%",
          },
          {},
          {}
        ),
      },
      children: children.map((child) => flexItemBlock([child])),
    },
  ],
});

const blockText = (block: any) => JSON.stringify(block || {}).toLowerCase();

const hasKeyword = (block: any, keywords: string[]) => {
  const text = blockText(block);
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
};

const hasTypeOrKeyword = (block: any, type: string, keywords: string[]) =>
  block?.type === type || hasKeyword(block, keywords);

const findFooterIndex = (blocks: any[]) =>
  blocks.findIndex((block) =>
    hasTypeOrKeyword(block, "footer", [
      "all rights reserved",
      "follow us",
      "copyright",
    ])
  );

const upsertBlockBeforeFooter = (
  currentBlocks: any[],
  newBlock: any,
  duplicateCheck: (block: any) => boolean
) => {
  const safeBlocks = Array.isArray(currentBlocks) ? currentBlocks : [];
  const existingIndex = safeBlocks.findIndex(duplicateCheck);

  if (existingIndex >= 0) {
    return [
      ...safeBlocks.slice(0, existingIndex),
      newBlock,
      ...safeBlocks.slice(existingIndex + 1),
    ];
  }

  const footerIndex = findFooterIndex(safeBlocks);
  const insertIndex = footerIndex >= 0 ? footerIndex : safeBlocks.length;

  return [
    ...safeBlocks.slice(0, insertIndex),
    newBlock,
    ...safeBlocks.slice(insertIndex),
  ];
};

// ============================================
// ASSISTANT PRESET BLOCKS
// ============================================

const createServicesSection = (category: string): any => {
  const isRestaurant = category === "restaurant";
  const isEducation = category === "education";

  const services = isRestaurant
    ? [
        ["🍽️", "Signature Menu", "A carefully crafted menu designed for memorable dining experiences."],
        ["📅", "Table Reservations", "Simple booking options for lunch, dinner, and private events."],
        ["🚚", "Takeaway & Delivery", "Convenient meal options for customers who prefer to eat at home."],
        ["🎉", "Private Events", "Custom menus and service for birthdays, groups, and celebrations."],
        ["🥗", "Fresh Ingredients", "Seasonal ingredients selected for quality, flavor, and freshness."],
        ["⭐", "Guest Experience", "Friendly service focused on comfort, trust, and satisfaction."],
      ]
    : isEducation
    ? [
        ["🎓", "Online Courses", "Structured courses that help learners build practical skills."],
        ["🧑‍🏫", "Live Workshops", "Interactive sessions guided by experienced trainers."],
        ["📜", "Certification Programs", "Career-focused programs with clear learning outcomes."],
        ["🤝", "Mentorship", "Personal guidance to help students progress with confidence."],
        ["💼", "Career Support", "Resources that prepare learners for real professional opportunities."],
        ["📚", "Learning Resources", "Helpful materials, exercises, and projects for continued practice."],
      ]
    : [
        ["⚙️", "Workflow Automation", "Automate repetitive tasks and reduce manual work across teams."],
        ["📊", "Data Management", "Organize business data and make it easier to use every day."],
        ["🤖", "AI Assistance", "Use AI to support decisions, content, and productivity."],
        ["🔌", "API Integrations", "Connect your tools and keep information moving smoothly."],
        ["☁️", "Cloud Infrastructure", "Build reliable systems that scale with your business."],
        ["🛡️", "Security Support", "Protect workflows and data with safer digital operations."],
      ];

  const serviceCards = services.map(([icon, title, description]) =>
    gridItemBlock([
      {
        id: makeAssistantId("assistant-service-card"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle(
            {
              padding: "28px",
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              textAlign: "center",
              height: "100%",
            },
            {},
            {}
          ),
        },
        children: [
          textBlock(icon, { fontSize: "38px", marginBottom: "0" }),
          textBlock(title, {
            fontSize: "18px",
            fontWeight: "900",
            color: "#0f172a",
            marginBottom: "0",
          }),
          textBlock(description, {
            fontSize: "14px",
            color: "#64748b",
            lineHeight: "1.6",
            marginBottom: "0",
          }),
        ],
      },
    ])
  );

  return sectionBlock(
    [
      titleBlock("Our Services"),
      textBlock(
        "Explore practical services designed to support growth, productivity, and better customer experiences.",
        { maxWidth: "760px", marginBottom: "40px" }
      ),
      {
        id: makeAssistantId("assistant-services-grid"),
        type: "grid",
        data: {
          props: {},
          style: responsiveStyle(
            {
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "24px",
              maxWidth: "1100px",
              width: "100%",
            },
            { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
            { gridTemplateColumns: "1fr" }
          ),
        },
        children: serviceCards,
      },
    ],
    { backgroundColor: "#f8fafc" }
  );
};

const createFAQSection = (): any => {
  const faqs = [
    ["How can we get started?", "You can contact our team and we will guide you through the best option for your goals."],
    ["Can the solution be customized?", "Yes, the structure can be adapted to match your services, audience, and business needs."],
    ["Is this suitable for small teams?", "Yes, the solution is designed to be simple for small teams and scalable for larger organizations."],
    ["Do you provide support?", "Yes, support can be included to help with setup, updates, and ongoing improvements."],
  ];

  return sectionBlock(
    [
      titleBlock("Frequently Asked Questions"),
      textBlock("Find answers to common questions before getting started.", {
        maxWidth: "720px",
        marginBottom: "36px",
      }),
      {
        id: makeAssistantId("assistant-faq-list"),
        type: "flex",
        data: {
          props: {},
          style: responsiveStyle(
            {
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "860px",
              width: "100%",
            },
            {},
            {}
          ),
        },
        children: faqs.map(([question, answer]) => ({
          id: makeAssistantId("assistant-faq-item"),
          type: "flex",
          data: {
            props: {},
            style: responsiveStyle(
              {
                padding: "22px 26px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              },
              {},
              { padding: "18px" }
            ),
          },
          children: [
            textBlock(question, {
              fontSize: "18px",
              fontWeight: "900",
              color: "#0f172a",
              textAlign: "left",
              marginBottom: "0",
            }),
            textBlock(answer, {
              fontSize: "15px",
              color: "#64748b",
              textAlign: "left",
              marginBottom: "0",
            }),
          ],
        })),
      },
    ],
    { backgroundColor: "#ffffff" }
  );
};

const createTestimonialsSection = (): any => {
  const testimonials = [
    { name: "Sarah M.", role: "Operations Manager", quote: "The team helped us simplify our process and save time every week." },
    { name: "David R.", role: "Startup Founder", quote: "A clean and reliable solution that made our digital workflow easier." },
    { name: "Maya T.", role: "Product Lead", quote: "The experience feels professional, clear, and easy for our team to use." },
  ];

  return sectionBlock(
    [
      titleBlock("What our clients say"),
      textBlock("Real feedback from people who improved their workflow with our solution.", {
        maxWidth: "760px",
        marginBottom: "40px",
      }),
      {
        id: makeAssistantId("assistant-testimonials-grid"),
        type: "grid",
        data: {
          props: {},
          style: responsiveStyle(
            {
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "24px",
              maxWidth: "1100px",
              width: "100%",
            },
            { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
            { gridTemplateColumns: "1fr" }
          ),
        },
        children: testimonials.map((item) =>
          gridItemBlock([
            {
              id: makeAssistantId("assistant-testimonial-card"),
              type: "flex",
              data: {
                props: {},
                style: responsiveStyle(
                  {
                    padding: "28px",
                    backgroundColor: "#ffffff",
                    borderRadius: "18px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    height: "100%",
                  },
                  {},
                  {}
                ),
              },
              children: [
                textBlock("★★★★★", { fontSize: "18px", color: "#f59e0b", textAlign: "left", marginBottom: "0" }),
                textBlock(item.quote, {
                  fontSize: "15px",
                  color: "#334155",
                  textAlign: "left",
                  lineHeight: "1.7",
                  marginBottom: "0",
                }),
                textBlock(`${item.name} — ${item.role}`, {
                  fontSize: "14px",
                  fontWeight: "900",
                  color: "#0f172a",
                  textAlign: "left",
                  marginBottom: "0",
                }),
              ],
            },
          ])
        ),
      },
    ],
    { backgroundColor: "#f8fafc" }
  );
};

const createPricingSection = (): any => {
  const plans = [
    { name: "Starter", price: "$29/mo", features: ["Core features", "Basic support", "Up to 5 users"], cta: "Get Started" },
    { name: "Growth", price: "$79/mo", features: ["Advanced workflows", "Priority support", "Up to 20 users"], cta: "Start Free Trial" },
    { name: "Scale", price: "$199/mo", features: ["Enterprise controls", "Dedicated support", "Unlimited users"], cta: "Contact Sales" },
  ];

  return sectionBlock(
    [
      titleBlock("Simple pricing for every stage"),
      textBlock("Choose a plan that matches your current needs and scale when your team grows.", {
        maxWidth: "760px",
        marginBottom: "40px",
      }),
      {
        id: makeAssistantId("assistant-pricing-grid"),
        type: "grid",
        data: {
          props: {},
          style: responsiveStyle(
            {
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "24px",
              maxWidth: "1100px",
              width: "100%",
            },
            { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
            { gridTemplateColumns: "1fr" }
          ),
        },
        children: plans.map((plan) =>
          gridItemBlock([
            {
              id: makeAssistantId("assistant-pricing-card"),
              type: "flex",
              data: {
                props: {},
                style: responsiveStyle(
                  {
                    padding: "32px",
                    borderRadius: "18px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    height: "100%",
                  },
                  {},
                  { padding: "24px" }
                ),
              },
              children: [
                textBlock(plan.name, { fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "0" }),
                textBlock(plan.price, { fontSize: "34px", fontWeight: "900", color: "#2563eb", marginBottom: "0" }),
                {
                  id: makeAssistantId("assistant-pricing-features"),
                  type: "flex",
                  data: {
                    props: {},
                    style: responsiveStyle(
                      {
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "100%",
                      },
                      {},
                      {}
                    ),
                  },
                  children: plan.features.map((feature) =>
                    textBlock(`✓ ${feature}`, {
                      fontSize: "14px",
                      color: "#64748b",
                      textAlign: "left",
                      marginBottom: "0",
                    })
                  ),
                },
                buttonBlock(plan.cta, "#contact"),
              ],
            },
          ])
        ),
      },
    ],
    { backgroundColor: "#f8fafc" }
  );
};

// ============================================
// COMPONENT
// ============================================

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  siteId,
  pageId,
  blocks = [],
  pageTitle,
  slug,
  hasGlobalNavbar,
  hasGlobalFooter,
  actions,
  setPageTitle,
  selectedBlockId,
  editSelectedBlock,
  setSelectedBlockId,
  onNavigate,
  generateAiPage,
  askAssistant,
  hydrateBlocks,
  designCopilotChat,
  designCopilotApply,
}) => {
  // ===== STATE =====

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [assistantReply, setAssistantReply] = useState<AssistantResponse | null>(null);

  // ===== DESIGN COPILOT STATE =====
  const [activeTab, setActiveTab] = useState<
    "assistant" | "copilot" | "history"
  >("assistant");
  const [designSuggestions, setDesignSuggestions] = useState<any[]>([]);
  const [designReply, setDesignReply] = useState<string>("");

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [appliedSuggestionId, setAppliedSuggestionId] = useState<string | null>(null);
  const [isApplyingAll, setIsApplyingAll] = useState(false);
  // ===== HELPERS =====

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

const commitBlocks = (
  nextBlocks: any[]
) => {
  const safeNextBlocks =
    Array.isArray(nextBlocks)
      ? nextBlocks
      : [];

  const hydratedBlocks =
    hydrateBlocks
      ? hydrateBlocks(
          safeNextBlocks
        )
      : safeNextBlocks;

  const canonicalBlocks =
    normalizeCanonicalContainers(
      hydratedBlocks
    );

  actions.setBlocks(
    canonicalBlocks
  );

  return canonicalBlocks;
};
  const findBlockById = (tree: any[], id: string | null | undefined): any | null => {
    if (!id) return null;
    for (const block of tree || []) {
      if (block.id === id) return block;
      const found = findBlockById(block.children || [], id);
      if (found) return found;
    }
    return null;
  };

  const replaceBlockById = (tree: any[], id: string, updatedBlock: any): any[] =>
    (tree || []).map((block) => {
      if (block.id === id) return updatedBlock;
      return {
        ...block,
        children: Array.isArray(block.children) ? replaceBlockById(block.children, id, updatedBlock) : [],
      };
    });

  const handleEditSelectedBlock = async () => {
    if (!selectedBlockId) {
      showSnackbar("⚠️ Select a block first.", "warning");
      return;
    }
    if (!aiPrompt.trim()) {
      showSnackbar("⚠️ Write what you want to change.", "warning");
      return;
    }

    if (isObviousConversationalPrompt(aiPrompt)) {
      const message = getConversationalAssistantMessage(aiPrompt);
      setAssistantReply({
        kind: "message",
        intent: "GENERAL_CONVERSATION",
        message,
        reply: message,
        category: "conversation",
        suggestions: [],
      });
      showSnackbar("This looks like a conversation, not a block edit.", "info");
      return;
    }

    const selectedBlock = findBlockById(blocks, selectedBlockId);
    if (!selectedBlock) {
      showSnackbar("⚠️ Selected block not found.", "warning");
      return;
    }

    try {
      setAiLoading(true);
      const result = await editSelectedBlock({
        siteId,
        pageId,
        prompt: aiPrompt,
        block: selectedBlock,
        pageTitle,
        slug,
      }).unwrap();

      const data = result?.data || result;
      if (!data?.block) throw new Error("No updated block returned");

      const nextBlocks = replaceBlockById(blocks, selectedBlockId, data.block);
      commitBlocks(nextBlocks);

      setAssistantReply({
        reply: data.reply || "✅ Selected block updated successfully.",
        category: "block-edit",
        suggestions: [],
      });

      showSnackbar("✅ Selected block updated successfully.", "success");
    } catch (error) {
      console.error("EDIT_SELECTED_BLOCK_FAILED", error);
      showSnackbar("❌ Failed to edit selected block.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // ===== APPLY SUGGESTION =====

  const applySuggestion = async (suggestion: AssistantSuggestion) => {
    try {
      setAppliedSuggestionId(suggestion.id);

      switch (suggestion.action) {
        case "IMPROVE_HERO": {
          const heroBlock = findHeroBlock(blocks);
          if (!heroBlock) {
            showSnackbar("⚠️ Hero section not found. Generate a page first.", "warning");
            break;
          }

          const payload = suggestion.payload || {};
          const category = assistantReply?.category || "technology";
          const heroTitle = payload.title || "Build a better digital experience";
          const heroText = payload.text || "Improve your website with clearer messaging, stronger structure, and a more professional presentation.";
          const heroButton = payload.button || "Get Started";

          const titleNode = findBlock(heroBlock.children || [], (child: any) => child.type === "title");
          const textNode = findBlock(heroBlock.children || [], (child: any) => child.type === "text");
          const buttonNode = findBlock(heroBlock.children || [], (child: any) => child.type === "button");

          const updateHeroTree = (tree: any[]): any[] =>
            tree.map((block) => {
              if (titleNode && block.id === titleNode.id) {
                return {
                  ...block,
                  data: { ...block.data, props: { ...block.data?.props, content: heroTitle, text: heroTitle } },
                };
              }
              if (textNode && block.id === textNode.id) {
                return {
                  ...block,
                  data: { ...block.data, props: { ...block.data?.props, text: heroText, content: heroText } },
                };
              }
              if (buttonNode && block.id === buttonNode.id) {
                return {
                  ...block,
                  data: { ...block.data, props: { ...block.data?.props, label: heroButton } },
                };
              }
              return { ...block, children: Array.isArray(block.children) ? updateHeroTree(block.children) : [] };
            });

          const updatedBlocks = updateHeroTree(Array.isArray(blocks) ? blocks : []);
          commitBlocks(updatedBlocks);
          setSelectedBlockId(heroBlock.id);
          setTimeout(() => setSelectedBlockId(null), 2500);

          setAssistantReply((prev) =>
            prev ? { ...prev, reply: `✅ Hero section improved. The page now has clearer ${category} messaging with "${heroTitle}".` } : prev
          );
          showSnackbar("✅ Hero improved successfully.", "success");
          break;
        }

        case "ADD_SERVICES": {
          const category = assistantReply?.category || "technology";
          const servicesBlock = createServicesSection(category);
          const nextBlocks = upsertBlockBeforeFooter(
            Array.isArray(blocks) ? blocks : [],
            servicesBlock,
            (block: any) => hasKeyword(block, ["our services", "workflow automation", "signature menu", "online courses"])
          );
          commitBlocks(nextBlocks);
          setSelectedBlockId(servicesBlock.id);
          setAssistantReply((prev) =>
            prev ? { ...prev, reply: "✅ Services section added successfully. You can now edit the service cards directly in the editor." } : prev
          );
          showSnackbar("✅ Services section added successfully.", "success");
          break;
        }

        case "ADD_FAQ": {
          const faqBlock = createFAQSection();
          const nextBlocks = upsertBlockBeforeFooter(
            Array.isArray(blocks) ? blocks : [],
            faqBlock,
            (block: any) => hasKeyword(block, ["frequently asked questions", "how can we get started", "faq"])
          );
          commitBlocks(nextBlocks);
          setSelectedBlockId(faqBlock.id);
          setAssistantReply((prev) =>
            prev ? { ...prev, reply: "✅ FAQ section added successfully. Visitors can now find clear answers to common questions." } : prev
          );
          showSnackbar("✅ FAQ section added successfully.", "success");
          break;
        }

        case "ADD_CTA": {
          const ctaBlock = generateCTAPreset({
            title: "Ready to take the next step?",
            text: "Contact our team today and start building a better digital experience.",
            actions: [{ label: "Contact Us", href: "#contact" }],
          });

          if (!ctaBlock) {
            showSnackbar("❌ CTA block was not created.", "error");
            break;
          }

          const ctaBlocks = Array.isArray(ctaBlock) ? ctaBlock : [ctaBlock];
          const safeBlocks = Array.isArray(blocks) ? blocks : [];
          const existingCtaIndex = safeBlocks.findIndex((block: any) =>
            hasKeyword(block, ["ready to take the next step", "ready to launch", "contact us"])
          );

          let nextBlocks: any[];
          if (existingCtaIndex >= 0) {
            nextBlocks = [...safeBlocks.slice(0, existingCtaIndex), ...ctaBlocks, ...safeBlocks.slice(existingCtaIndex + 1)];
          } else {
            const footerIndex = findFooterIndex(safeBlocks);
            const insertIndex = footerIndex >= 0 ? footerIndex : safeBlocks.length;
            nextBlocks = [...safeBlocks.slice(0, insertIndex), ...ctaBlocks, ...safeBlocks.slice(insertIndex)];
          }

          commitBlocks(nextBlocks);
          setSelectedBlockId(ctaBlocks[0]?.id || null);
          setAssistantReply((prev) =>
            prev ? { ...prev, reply: "✅ CTA section updated successfully. The page now has a clearer action for visitors." } : prev
          );
          showSnackbar("✅ CTA section updated successfully.", "success");
          break;
        }

        case "ADD_TESTIMONIALS": {
          const testimonialBlock = createTestimonialsSection();
          const nextBlocks = upsertBlockBeforeFooter(
            Array.isArray(blocks) ? blocks : [],
            testimonialBlock,
            (block: any) => hasKeyword(block, ["what our clients say", "testimonial", "testimonials"])
          );
          commitBlocks(nextBlocks);
          setSelectedBlockId(testimonialBlock.id);
          setAssistantReply((prev) =>
            prev ? { ...prev, reply: "✅ Testimonials section added successfully. You can now edit the client quotes directly in the editor." } : prev
          );
          showSnackbar("✅ Testimonials section added successfully.", "success");
          break;
        }

        case "ADD_PRICING": {
          const pricingBlock = createPricingSection();
          const nextBlocks = upsertBlockBeforeFooter(
            Array.isArray(blocks) ? blocks : [],
            pricingBlock,
            (block: any) => hasKeyword(block, ["simple pricing", "starter", "growth", "scale", "pricing"])
          );
          commitBlocks(nextBlocks);
          setSelectedBlockId(pricingBlock.id);
          setAssistantReply((prev) =>
            prev ? { ...prev, reply: " Pricing section added successfully. You can now edit plans and prices directly in the editor." } : prev
          );
          showSnackbar(" Pricing section added successfully.", "success");
          break;
        }

        default: {
          showSnackbar(` Unknown action: ${suggestion.action}`, "warning");
        }
      }
    } catch (error) {
      console.error("APPLY_ERROR", error);
      showSnackbar(" Failed to apply improvement. Please try again.", "error");
    } finally {
      setAppliedSuggestionId(null);
    }
  };

  // ===== GENERATE PAGE =====
 const applyThemeToGeneratedButtons = (
  tree: any[]
): any[] =>
  (tree || []).map((block) => {
    const children =
      applyThemeToGeneratedButtons(
        block.children || []
      );

    if (block.type !== "button") {
      return {
        ...block,
        children
      };
    }

    const cleanStyle = (
      style: Record<string, any> = {},
      mobile = false
    ) => {
      const cleaned = {
        ...style
      };

      delete cleaned.background;
      delete cleaned.backgroundColor;
      delete cleaned.backgroundImage;
      delete cleaned.color;
      delete cleaned.border;
      delete cleaned.borderColor;
      delete cleaned.boxShadow;
      delete cleaned.padding;

      return {
        ...cleaned,

        fontSize: "15px",
        fontWeight: 700,

        paddingTop:
          mobile
            ? "11px"
            : "12px",

        paddingBottom:
          mobile
            ? "11px"
            : "12px",

        paddingLeft:
          mobile
            ? "20px"
            : "24px",

        paddingRight:
          mobile
            ? "20px"
            : "24px",

        borderRadius: "9999px"
      };
    };

    return {
      ...block,

      data: {
        ...(block.data || {}),

        props: {
          ...(block.data?.props || {}),

          useTheme: true,

          variant:
            block.data?.props?.variant ||
            "contained"
        },

        style: {
          ...(block.data?.style || {}),

          desktop:
            cleanStyle(
              block.data?.style?.desktop
            ),

          tablet:
            cleanStyle(
              block.data?.style?.tablet
            ),

          mobile:
            cleanStyle(
              block.data?.style?.mobile,
              true
            )
        }
      },

      children
    };
  });
const applyThemeToGeneratedTypography = (
  tree: any[]
): any[] => {
  const colorMap: Record<string, string> = {
    "#0f172a": "text",
    "#334155": "text",
    "#64748b": "muted",
    "#2563eb": "primary",
    "#f59e0b": "secondary",

    "#ffffff": "#ffffff",
    "#fff": "#ffffff",
    white: "#ffffff",

    text: "text",
    muted: "muted",
    primary: "primary",
    secondary: "secondary"
  };

  const normalizeColor = (
    value: unknown
  ): string | undefined => {
    if (typeof value !== "string") {
      return undefined;
    }

    return colorMap[
      value
        .replace(/\s+/g, "")
        .toLowerCase()
    ];
  };

  const cleanStyle = (
    style: Record<string, any> = {}
  ) => {
    const cleaned = {
      ...style
    };

    const normalizedColor =
      normalizeColor(
        cleaned.color
      );

    if (normalizedColor) {
      cleaned.color =
        normalizedColor;
    } else {
      delete cleaned.color;
    }

    const textFill =
      cleaned.WebkitTextFillColor;

    if (
      typeof textFill === "string" &&
      textFill
        .trim()
        .toLowerCase() !==
        "transparent"
    ) {
      const normalizedFill =
        normalizeColor(textFill);

      if (normalizedFill) {
        cleaned.WebkitTextFillColor =
          normalizedFill;
      } else {
        delete cleaned.WebkitTextFillColor;
      }
    }

    return cleaned;
  };

  return (tree || []).map(
    (block) => {
      const children =
        applyThemeToGeneratedTypography(
          block.children || []
        );

      if (
        block.type !== "title" &&
        block.type !== "text"
      ) {
        return {
          ...block,
          children
        };
      }

      const sourceStyle =
        block.data?.style || {};

      const hasResponsiveStyle =
        sourceStyle.desktop ||
        sourceStyle.tablet ||
        sourceStyle.mobile;

      const nextStyle =
        hasResponsiveStyle
          ? {
              ...sourceStyle,

              desktop:
                cleanStyle(
                  sourceStyle.desktop
                ),

              tablet:
                cleanStyle(
                  sourceStyle.tablet
                ),

              mobile:
                cleanStyle(
                  sourceStyle.mobile
                )
            }
          : cleanStyle(
              sourceStyle
            );

      return {
        ...block,

        data: {
          ...(block.data || {}),
          style: nextStyle
        },

        children
      };
    }
  );
};

const mergeGeneratedResponsiveStyle = (
  style: Record<string, any> = {},
  desktop: Record<string, any> = {},
  tablet: Record<string, any> = {},
  mobile: Record<string, any> = {}
) => {
  const {
    desktop: currentDesktop,
    tablet: currentTablet,
    mobile: currentMobile,
    ...otherStyle
  } = style;

  const hasResponsiveStyle =
    currentDesktop ||
    currentTablet ||
    currentMobile;

  return {
    ...(hasResponsiveStyle
      ? otherStyle
      : {}),

    desktop: {
      ...(hasResponsiveStyle
        ? currentDesktop || {}
        : style),
      ...desktop
    },

    tablet: {
      ...(currentTablet || {}),
      ...tablet
    },

    mobile: {
      ...(currentMobile || {}),
      ...mobile
    }
  };
};

const applyGeneratedHeroLayout = (
  tree: any[]
): any[] => {
  const safeTree =
    Array.isArray(tree)
      ? tree
      : [];

  const hero =
    findHeroBlock(safeTree);

  if (!hero) {
    return safeTree;
  }

  const heroFlex =
    findBlock(
      hero.children || [],
      (block: any) =>
        block.type === "flex"
    );

  const heroTitle =
    findBlock(
      hero.children || [],
      (block: any) =>
        block.type === "title"
    );

  const heroText =
    findBlock(
      hero.children || [],
      (block: any) =>
        block.type === "text"
    );

  const heroImage =
    findBlock(
      hero.children || [],
      (block: any) =>
        block.type === "image"
    );

  const flexItems =
    Array.isArray(
      heroFlex?.children
    )
      ? heroFlex.children.filter(
          (block: any) =>
            block.type === "flexItem"
        )
      : [];

  const contentItemId =
    flexItems[0]?.id;

  const mediaItemId =
    flexItems[1]?.id;

  const updateTree = (
    blocks: any[]
  ): any[] =>
    (blocks || []).map(
      (block) => {
        let nextStyle =
          block.data?.style || {};

        if (
          heroFlex &&
          block.id === heroFlex.id
        ) {
          nextStyle =
            mergeGeneratedResponsiveStyle(
              nextStyle,

              {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent:
                  "space-between",

                gap:
                  "clamp(32px, 5vw, 72px)",

                width: "100%",
                maxWidth: "1200px"
              },

              {
                flexDirection: "row",
                alignItems: "center",
                gap: "32px",
                width: "100%"
              },

              {
                flexDirection: "column",
                alignItems: "stretch",
                gap: "32px",
                width: "100%"
              }
            );
        }

        if (
          contentItemId &&
          block.id === contentItemId
        ) {
          nextStyle =
            mergeGeneratedResponsiveStyle(
              nextStyle,

              {
                width: "54%",
                maxWidth: "660px",
                flex: "1 1 54%"
              },

              {
                width: "52%",
                maxWidth: "560px",
                flex: "1 1 52%"
              },

              {
                width: "100%",
                maxWidth: "100%",
                flex: "1 1 100%"
              }
            );
        }

        if (
          mediaItemId &&
          block.id === mediaItemId
        ) {
          nextStyle =
            mergeGeneratedResponsiveStyle(
              nextStyle,

              {
                width: "46%",
                maxWidth: "540px",
                flex: "1 1 46%"
              },

              {
                width: "48%",
                maxWidth: "480px",
                flex: "1 1 48%"
              },

              {
                width: "100%",
                maxWidth: "100%",
                flex: "1 1 100%"
              }
            );
        }

        if (
          heroTitle &&
          block.id === heroTitle.id
        ) {
          nextStyle =
            mergeGeneratedResponsiveStyle(
              nextStyle,

              {
                fontSize:
                  "clamp(44px, 5vw, 68px)",

                lineHeight: "1.05",
                letterSpacing: "-0.035em",
                width: "100%",
                maxWidth: "680px",
                textAlign: "left"
              },

              {
                fontSize:
                  "clamp(40px, 5vw, 56px)",

                maxWidth: "560px",
                textAlign: "left"
              },

              {
                fontSize:
                  "clamp(36px, 10vw, 48px)",

                maxWidth: "100%",
                textAlign: "left"
              }
            );
        }

        if (
          heroText &&
          block.id === heroText.id
        ) {
          nextStyle =
            mergeGeneratedResponsiveStyle(
              nextStyle,

              {
                fontSize: "18px",
                lineHeight: "1.7",
                maxWidth: "620px",
                textAlign: "left"
              },

              {
                fontSize: "17px",
                maxWidth: "520px",
                textAlign: "left"
              },

              {
                fontSize: "16px",
                maxWidth: "100%",
                textAlign: "left"
              }
            );
        }

        if (
          heroImage &&
          block.id === heroImage.id
        ) {
          nextStyle =
            mergeGeneratedResponsiveStyle(
              nextStyle,

              {
                width: "100%",
                maxWidth: "540px",
                marginLeft: "auto",
                borderRadius: "24px"
              },

              {
                width: "100%",
                maxWidth: "480px",
                marginLeft: "auto"
              },

              {
                width: "100%",
                maxWidth: "100%",
                marginLeft: "0"
              }
            );
        }

        return {
          ...block,

          data: {
            ...(block.data || {}),
            style: nextStyle
          },

          children:
            Array.isArray(
              block.children
            )
              ? updateTree(
                  block.children
                )
              : []
        };
      }
    );

  return updateTree(
    safeTree
  );
};
const filterGeneratedGlobalLayout = (
  tree: any[]
): any[] => {
  return (Array.isArray(tree) ? tree : []).filter(
    (block) => {
      if (
        hasGlobalNavbar &&
        block?.type === "navbar"
      ) {
        return false;
      }

      if (
        hasGlobalFooter &&
        block?.type === "footer"
      ) {
        return false;
      }

      return true;
    }
  );
};
const collectBlockTypes = (
  tree: any[],
  result: any[] = []
): any[] => {
  for (const block of tree || []) {
    result.push({
      id: block.id,
      type: block.type,
      props: block.data?.props,
    });

    if (Array.isArray(block.children)) {
      collectBlockTypes(
        block.children,
        result
      );
    }
  }

  return result;
};
  const handleGeneratePage = async () => {
    if (!aiPrompt.trim()) {
      showSnackbar("Please describe what you want to generate.", "warning");
      return;
    }
    if (isObviousConversationalPrompt(aiPrompt)) {
      const message = getConversationalAssistantMessage(aiPrompt);
      setAssistantReply({
        kind: "message",
        intent: "GENERAL_CONVERSATION",
        message,
        reply: message,
        category: "conversation",
        suggestions: [],
      });
      showSnackbar("This looks like a conversation, not a page generation request.", "info");
      return;
    }

    if (!siteId) {
      showSnackbar("⚠️ Missing site id.", "warning");
      return;
    }

    try {
      setAiLoading(true);
      const result = await generateAiPage({ siteId: Number(siteId), prompt: aiPrompt }).unwrap();
      const generatedPage = result?.data || result;
      if (!generatedPage?.id) throw new Error("AI generation returned a page without an id");
const buttonThemedBlocks =
  applyThemeToGeneratedButtons(
    generatedPage.blocks || []
  );

const themedBlocks =
  applyThemeToGeneratedTypography(
    buttonThemedBlocks
  );
const heroLayoutBlocks =
  applyGeneratedHeroLayout(
    themedBlocks
  );

const filteredBlocks =
  filterGeneratedGlobalLayout(
    heroLayoutBlocks
  );

const hydrated =
  commitBlocks(filteredBlocks);
      setPageTitle(generatedPage.title || "Generated Page");
      setSelectedBlockId(hydrated[0]?.id || null);
      setAssistantReply(null);

      if (onNavigate) {
        onNavigate(`/sites/${siteId}/pages/${generatedPage.id}/edit`);
      }

      showSnackbar(` Page "${generatedPage.title}" generated successfully!`, "success");
    } catch (error) {
      console.error("AI_GENERATION_FAILED", error);
      showSnackbar("Generation failed. Please try again.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // ===== ASK ASSISTANT =====

  const handleAskAssistant = async () => {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      showSnackbar("⚠️ Generate a page first, then ask the assistant to analyze it.", "warning");
      return;
    }

    const prompt = aiPrompt.trim() || "Analyze this page and suggest improvements.";

    try {
      setAiLoading(true);
      const result = await askAssistant({
        prompt,
        blocks,
        pageTitle,
        slug,
        selectedBlockId,
      }).unwrap();
      const assistantData = result?.data || result;

      const normalizedSlug = String(slug || "").toLowerCase();
      const normalizedTitle = String(pageTitle || "").toLowerCase();
      const pageText = JSON.stringify(blocks || []).toLowerCase();

      const isContactPage =
        normalizedSlug.includes("contact") || normalizedTitle.includes("contact");

      const hasFAQ =
        pageText.includes("frequently asked questions") ||
        pageText.includes("faq") ||
        pageText.includes("do you provide") ||
        pageText.includes("common questions");

      const hasContactForm =
        pageText.includes("send us a message") ||
        pageText.includes("get in touch") ||
        pageText.includes("full name") ||
        pageText.includes("email address") ||
        pageText.includes("message");

      const filteredSuggestions = (assistantData.suggestions || []).filter(
        (suggestion: AssistantSuggestion) => {
          if (isContactPage) {
            if (["IMPROVE_HERO", "ADD_TESTIMONIALS", "ADD_PRICING", "ADD_SERVICES", "ADD_CTA"].includes(suggestion.action)) {
              return false;
            }
            if (suggestion.action === "ADD_FAQ" && hasFAQ) {
              return false;
            }
            return suggestion.action === "ADD_FAQ";
          }
          return true;
        }
      );

      setAssistantReply({
        ...assistantData,
        suggestions: filteredSuggestions,
        reply: isContactPage && hasContactForm && hasFAQ
          ? `✅ I analyzed "${pageTitle}". This contact page is complete: contact form, FAQ, and footer are present.`
          : assistantData.reply,
      });

      showSnackbar(`💡 Found ${filteredSuggestions.length} suggestions to improve your page.`, "success");
    } catch (error) {
      console.error("ASSISTANT_FAILED", error);
      showSnackbar("❌ Assistant failed. Please try again.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // ===== DESIGN COPILOT =====

  const handleDesignCopilot = async () => {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      showSnackbar("⚠️ Generate a page first, then use Design Co-Pilot.", "warning");
      return;
    }

    if (!designCopilotChat) {
      showSnackbar("⚠️ Design Co-Pilot is not available.", "warning");
      return;
    }

    const prompt = aiPrompt.trim() || "Improve the design and layout of this page.";

    try {
      setAiLoading(true);
  const result = await designCopilotChat({
  siteId,
  pageId,
  message: prompt,
  blocks,
  pageTitle,
  slug,
}).unwrap();

      const data = result?.data || result;

      setDesignSuggestions(data.suggestions || []);
      setDesignReply(data.reply || "✅ Design analysis complete.");

      showSnackbar(`💡 Found ${data.suggestions?.length || 0} design improvements.`, "success");
    } catch (error) {
      console.error("DESIGN_COPILOT_FAILED", error);
      showSnackbar("❌ Design Co-Pilot failed. Please try again.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDesignApply = async (suggestion: any) => {
    if (!designCopilotApply) {
      showSnackbar("⚠️ Design Co-Pilot is not available.", "warning");
      return;
    }

    try {
      setAppliedSuggestionId(suggestion.id);

     const result = await designCopilotApply({
  siteId,
  pageId,
  suggestion,
  blocks,
}).unwrap();

      const data = result?.data || result;

      if (data.blocks) {
        commitBlocks(data.blocks);
      }

      setDesignReply(data.reply || "✅ Design improvement applied successfully.");

      setDesignSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestion.id ? { ...s, applied: true } : s
        )
      );

      showSnackbar("✅ Design improvement applied successfully.", "success");
    } catch (error) {
      console.error("DESIGN_APPLY_FAILED", error);
      showSnackbar("❌ Failed to apply design improvement.", "error");
    } finally {
      setAppliedSuggestionId(null);
    }
  };
const handleDesignApplyAll = async () => {
  if (!designCopilotApply) {
    showSnackbar("⚠️ Design Co-Pilot is not available.", "warning");
    return;
  }

  const pendingSuggestions =
    designSuggestions.filter((item) => !item.applied);

  if (pendingSuggestions.length === 0) {
    showSnackbar("✅ All improvements are already applied.", "info");
    return;
  }

  try {
    setIsApplyingAll(true);

    let currentBlocks =
      Array.isArray(blocks) ? blocks : [];

    for (const suggestion of pendingSuggestions) {
      setAppliedSuggestionId(suggestion.id);

      const result = await designCopilotApply({
        siteId,
        pageId,
        suggestion,
        blocks: currentBlocks,
      }).unwrap();

      const data =
        result?.data || result;

      if (Array.isArray(data.blocks)) {
        currentBlocks = data.blocks;
      }
    }

    commitBlocks(currentBlocks);

    setDesignSuggestions((prev) =>
      prev.map((item) => ({
        ...item,
        applied: true,
      }))
    );

    setDesignReply(
      "✅ All design improvements were applied successfully. Review the page, then click Save."
    );

    showSnackbar("✅ All design improvements applied.", "success");
  } catch (error) {
    console.error("DESIGN_APPLY_ALL_FAILED", error);
    showSnackbar("❌ Failed to apply all design improvements.", "error");
  } finally {
    setAppliedSuggestionId(null);
    setIsApplyingAll(false);
  }
};
  // ===== RENDER =====

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        🤖 AI Assistant
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Mode Selector */}
      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={(_, value) => value && setActiveTab(value)}
        size="small"
        sx={{ mb: 2, width: "100%" }}
      >
        <ToggleButton value="assistant" sx={{ flex: 1, py: 1, borderRadius: 2 }}>
          <QuestionAnswerIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Assistant
        </ToggleButton>
        <ToggleButton value="copilot" sx={{ flex: 1, py: 1, borderRadius: 2 }}>
          <DesignServicesIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Co-Pilot
        </ToggleButton>
        <ToggleButton value="history" sx={{ flex: 1, py: 1, borderRadius: 2 }}>
          <HistoryIcon sx={{ mr: 0.5, fontSize: 18 }} />
          History
        </ToggleButton>
      </ToggleButtonGroup>

      {activeTab !== "history" && (
        <>
      {/* Input */}
      <TextField
        fullWidth
        multiline
        rows={activeTab === "copilot" ? 3 : 4}
        placeholder={
          activeTab === "copilot"
            ? "Describe design improvements... e.g. 'make it premium, center content, improve cards'"
            : "Describe what you want..."
        }
        value={aiPrompt}
        onChange={(event) => setAiPrompt(event.target.value)}
        inputProps={{ maxLength: 1000 }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            bgcolor: "background.paper",
          },
        }}
      />

      <Typography sx={{ mt: 0.5, textAlign: "right", fontSize: 12, color: "text.secondary" }}>
        {aiPrompt.length}/1000
      </Typography>

      {/* Buttons */}
      <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
        {activeTab === "assistant" ? (
          <>
            <Button
              sx={{ flex: 1, minWidth: 100, py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
              variant="contained"
              disabled={aiLoading}
              onClick={handleGeneratePage}
            >
              {aiLoading ? <CircularProgress size={22} color="inherit" /> : "✨ Generate"}
            </Button>

            <Button
              sx={{ flex: 1, minWidth: 100, py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
              variant="outlined"
              disabled={aiLoading || !Array.isArray(blocks) || blocks.length === 0}
              onClick={handleAskAssistant}
            >
              {aiLoading ? <CircularProgress size={22} /> : "💬 Ask"}
            </Button>

            <Button
              sx={{ flex: 1, minWidth: 100, py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none", bgcolor: "#1e293b", "&:hover": { bgcolor: "#0f172a" } }}
              variant="contained"
              disabled={aiLoading || !selectedBlockId}
              onClick={handleEditSelectedBlock}
            >
              🪄 Edit Block
            </Button>
          </>
        ) : (
          <Button
            fullWidth
            sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
            variant="contained"
            disabled={aiLoading || !Array.isArray(blocks) || blocks.length === 0}
            onClick={handleDesignCopilot}
          >
            {aiLoading ? <CircularProgress size={22} color="inherit" /> : "✨ Improve Design"}
          </Button>
        )}
      </Stack>

      {/* Info message */}
      {(!Array.isArray(blocks) || blocks.length === 0) && (
        <Typography sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
          Generate a page first, then use the tools above.
        </Typography>
      )}
        </>
      )}

      {activeTab === "history" && (
        <AiActivityHistoryPanel siteId={Number(siteId)} />
      )}

      {/* ===== ASSISTANT MODE ===== */}
      {activeTab === "assistant" && assistantReply && (
        <Box sx={{ mt: 3 }}>
          {assistantReply.kind !== "message" &&
            assistantReply.kind !== "clarification" &&
            (assistantReply.suggestions?.length || 0) > 0 && (
              <>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <Typography fontWeight={700}>Suggestions</Typography>
                  <Chip size="small" label={assistantReply.suggestions?.length || 0} sx={{ fontWeight: 700, height: 20, fontSize: 11 }} />
                </Stack>

                <Stack spacing={1}>
                  {assistantReply.suggestions?.map((item: AssistantSuggestion, index: number) => {
                    const isApplying = appliedSuggestionId === item.id;

                    return (
                      <Paper
                        key={`${item.id}-${index}`}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontSize={14} fontWeight={700}>
                            {item.title}
                          </Typography>
                          <Typography fontSize={13} color="text.secondary">
                            {item.description}
                          </Typography>
                        </Box>

                        <Button
                          size="small"
                          variant="text"
                          disabled={isApplying}
                          onClick={() => applySuggestion(item)}
                          sx={{ fontWeight: 700, textTransform: "none", flexShrink: 0 }}
                        >
                          {isApplying ? <CircularProgress size={18} /> : "Apply"}
                        </Button>
                      </Paper>
                    );
                  })}
                </Stack>
              </>
            )}

          <Typography fontWeight={700} mt={3} mb={1}>
            {assistantReply.kind === "clarification" ? "Question" : "Reply"}
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "#f8fafc",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography fontSize={14}>🤖 {assistantReply.message || assistantReply.reply}</Typography>
          </Paper>
        </Box>
      )}

      {/* ===== DESIGN COPILOT MODE ===== */}
      {activeTab === "copilot" && (designSuggestions.length > 0 || designReply) && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
  <Typography fontWeight={700}>
    <DesignServicesIcon
      sx={{
        fontSize: 18,
        verticalAlign: "middle",
        mr: 0.5,
      }}
    />
    Design Improvements
  </Typography>

  <Chip
    size="small"
    label={designSuggestions.length || 0}
    sx={{
      fontWeight: 700,
      height: 20,
      fontSize: 11,
    }}
  />

  <Box sx={{ flex: 1 }} />

  <Button
    size="small"
    variant="contained"
    disabled={
      aiLoading ||
      isApplyingAll ||
      designSuggestions.length === 0 ||
      designSuggestions.every((item) => item.applied)
    }
    onClick={handleDesignApplyAll}
    sx={{
      textTransform: "none",
      fontWeight: 700,
      borderRadius: 2,
      py: 0.5,
      px: 1.5,
    }}
  >
    {isApplyingAll ? (
      <CircularProgress size={16} color="inherit" />
    ) : (
      "Apply All"
    )}
  </Button>
</Stack>

          <Stack spacing={1}>
            {designSuggestions.map((item: any, index: number) => {
              const isApplying = appliedSuggestionId === item.id;
              const isApplied = item.applied === true;

              return (
                <Paper
                  key={`${item.id}-${index}`}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isApplied ? "success.main" : "divider",
                    bgcolor: isApplied ? "success.light" : "transparent",
                    opacity: isApplied ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={14} fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography fontSize={13} color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>

                  {isApplied ? (
                    <Chip size="small" label="Applied ✓" color="success" sx={{ fontWeight: 700, height: 24 }} />
                  ) : (
                    <Button
                      size="small"
                      variant="text"
                      disabled={isApplying || isApplyingAll}
                      onClick={() => handleDesignApply(item)}
                      sx={{ fontWeight: 700, textTransform: "none", flexShrink: 0 }}
                    >
                      {isApplying ? <CircularProgress size={18} /> : "Apply"}
                    </Button>
                  )}
                </Paper>
              );
            })}
          </Stack>

          {designReply && (
            <>
              <Typography fontWeight={700} mt={3} mb={1}>
                Reply
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f0fdf4",
                  border: "1px solid",
                  borderColor: "success.light",
                }}
              >
                <Typography fontSize={14}>✨ {designReply}</Typography>
              </Paper>
            </>
          )}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssistantPanel;
