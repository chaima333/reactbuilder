// aiAssistant/AssistantPanel.tsx

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
} from "@mui/material";
import { findHeroBlock, findBlock } from "./blockFinders";
import {
  getHeroStyleForCategory,
  getHeroTitleForCategory,
  getHeroTextForCategory,
  getHeroButtonForCategory,
} from "./heroPresets";
import { generateCTAPreset } from "../../presets/generateCTAPreset";

// ============================================
// TYPES
// ============================================

export type AssistantSuggestion = {
  id: string;
  title: string;
  description: string;
  action: "IMPROVE_HERO" | "ADD_SERVICES" | "ADD_FAQ" | "ADD_CTA" | "ADD_TESTIMONIALS" | "ADD_PRICING";
  payload?: any;
};

export type AssistantResponse = {
  reply: string;
  category: string;
  suggestions: AssistantSuggestion[];
};

// ============================================
// PROPS
// ============================================

interface AssistantPanelProps {
  siteId?: string | number;
  blocks: any[];
  pageTitle: string;
  slug: string;
  actions: {
    setBlocks: (blocks: any[]) => void;
    updateBlock: (id: string, updates: any) => void;
  };
  setPageTitle: (title: string) => void;
  setSelectedBlockId: (id: string | null) => void;
  onNavigate?: (path: string) => void;
  generateAiPage: (params: any) => any;
  askAssistant: (params: any) => any;
  hydrateBlocks: (blocks: any[]) => any[];
}

// ============================================
// COMPONENT
// ============================================

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  siteId,
  blocks = [],
  pageTitle,
  slug,
  actions,
  setPageTitle,
  setSelectedBlockId,
  onNavigate,
  generateAiPage,
  askAssistant,
  hydrateBlocks,
}) => {
  // ===== STATE =====
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [assistantReply, setAssistantReply] = useState<AssistantResponse | null>(null);
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

  // ===== HELPERS =====

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
          return;
        }

        const payload = suggestion.payload || {};
        const category = assistantReply?.category || "technology";
       const heroTitle = payload.title;
       const heroText = payload.text;
       const heroButton = payload.button;

        const titleBlock = findBlock(
          heroBlock.children || [],
          (child: any) => child.type === "title"
        );

        const textBlock = findBlock(
          heroBlock.children || [],
          (child: any) => child.type === "text"
        );

        const buttonBlock = findBlock(
          heroBlock.children || [],
          (child: any) => child.type === "button"
        );

        const updateHeroTree = (tree: any[]): any[] =>
          tree.map((block) => {
            if (block.id === titleBlock?.id) {
              return {
                ...block,
                data: {
                  ...block.data,
                  props: {
                    ...block.data?.props,
                    content: heroTitle,
                    text: heroTitle,
                  },
                },
              };
            }

            if (block.id === textBlock?.id) {
              return {
                ...block,
                data: {
                  ...block.data,
                  props: {
                    ...block.data?.props,
                    text: heroText,
                    content: heroText,
                  },
                },
              };
            }

            if (block.id === buttonBlock?.id) {
              return {
                ...block,
                data: {
                  ...block.data,
                  props: {
                    ...block.data?.props,
                    label: heroButton,
                  },
                },
              };
            }

            return {
              ...block,
              children: Array.isArray(block.children)
                ? updateHeroTree(block.children)
                : [],
            };
          });

        actions.setBlocks(
          updateHeroTree(Array.isArray(blocks) ? blocks : [])
        );

        setSelectedBlockId(heroBlock.id);
        setTimeout(() => setSelectedBlockId(null), 3000);

        showSnackbar(`✅ Hero improved successfully! "${heroTitle}"`, "success");

        setAssistantReply((prev) =>
          prev
            ? {
                ...prev,
                reply: `✅ Hero section improved! The page now has a professional ${category} design with "${heroTitle}".`,
              }
            : prev
        );

        break;
      }

      case "ADD_SERVICES": {
        showSnackbar("📋 Services section will be added in the next update.", "info");
        break;
      }

      case "ADD_FAQ": {
        showSnackbar("❓ FAQ section will be added in the next update.", "info");
        break;
      }

      case "ADD_CTA": {
        const ctaBlock = generateCTAPreset({
          title: "Ready to take the next step?",
          text: "Contact our team today and start building a better digital experience.",
          actions: [
            {
              label: "Contact Us",
              href: "#contact",
            },
          ],
        });

        if (!ctaBlock) {
          showSnackbar("❌ CTA block was not created.", "error");
          break;
        }

        const ctaBlocks = Array.isArray(ctaBlock)
          ? ctaBlock
          : [ctaBlock];

        const safeBlocks = Array.isArray(blocks) ? blocks : [];

        const isCtaBlock = (block: any) => {
          const text = JSON.stringify(block).toLowerCase();

          return (
            block.meta?.semanticType === "CTA_SECTION" ||
            block.data?.meta?.semanticType === "CTA_SECTION" ||
            text.includes("ready to launch") ||
            text.includes("contact us")
          );
        };

        const existingCtaIndex = safeBlocks.findIndex(isCtaBlock);

        if (existingCtaIndex >= 0) {
          actions.setBlocks([
            ...safeBlocks.slice(0, existingCtaIndex),
            ...ctaBlocks,
            ...safeBlocks.slice(existingCtaIndex + 1),
          ]);
        } else {
          const footerIndex = safeBlocks.findIndex((block: any) => {
            const text = JSON.stringify(block).toLowerCase();

            return (
              text.includes("all rights reserved") ||
              text.includes("follow us")
            );
          });

          const insertIndex =
            footerIndex >= 0 ? footerIndex : safeBlocks.length;

          actions.setBlocks([
            ...safeBlocks.slice(0, insertIndex),
            ...ctaBlocks,
            ...safeBlocks.slice(insertIndex),
          ]);
        }

        setSelectedBlockId(ctaBlocks[0].id);
        showSnackbar("✅ CTA section updated successfully.", "success");
        break;
      }

      case "ADD_TESTIMONIALS": {
        showSnackbar("⭐ Testimonials section will be added in the next update.", "info");
        break;
      }

      case "ADD_PRICING": {
        showSnackbar("💰 Pricing section will be added in the next update.", "info");
        break;
      }

      default: {
        showSnackbar(`⚠️ Unknown action: ${suggestion.action}`, "warning");
      }
    }
  } catch (error) {
    console.error("APPLY_ERROR", error);
    showSnackbar("❌ Failed to apply improvement. Please try again.", "error");
  } finally {
    setAppliedSuggestionId(null);
  }
};
  // ===== GENERATE PAGE =====

  const handleGeneratePage = async () => {
    if (!aiPrompt.trim()) {
      showSnackbar("Please describe what you want to generate.", "warning");
      return;
    }

    try {
      setAiLoading(true);

      const result = await generateAiPage({
        siteId: Number(siteId),
        prompt: aiPrompt,
      }).unwrap();

      const generatedPage = result;

      if (!generatedPage.id) {
        throw new Error("AI generation returned a page without an id");
      }

      const hydrated = hydrateBlocks(generatedPage.blocks || []);

      actions.setBlocks(hydrated as any);
      setPageTitle(generatedPage.title || "Generated Page");
      setSelectedBlockId(hydrated[0]?.id || null);

      // Clear previous assistant suggestions
      setAssistantReply(null);

      // Navigate if provided
      if (onNavigate) {
        onNavigate(`/sites/${siteId}/pages/${generatedPage.id}/edit`);
      }

      showSnackbar(`✅ Page "${generatedPage.title}" generated successfully!`, "success");
    } catch (error) {
      console.error("AI GENERATION FAILED", error);
      showSnackbar("❌ Generation failed. Please try again.", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // ===== ASK ASSISTANT =====

 const handleAskAssistant = async () => {
  if (blocks.length === 0) {
    showSnackbar(
      "⚠️ Generate a page first, then ask the assistant to analyze it.",
      "warning"
    );
    return;
  }

  const prompt =
    aiPrompt.trim() ||
    "Analyze this page and suggest improvements.";

  try {
    setAiLoading(true);
console.log("ASK_ASSISTANT_BLOCKS", {
  blocksLength: blocks?.length,
  firstBlock: blocks?.[0],
  pageTitle,
  slug,
});
    const result = await askAssistant({
      prompt,
      blocks,
      pageTitle,
      slug,
    }).unwrap();
console.log("ASSISTANT_RESULT", result);
    setAssistantReply(result.data);

    showSnackbar(
      `💡 Found ${result.data.suggestions?.length || 0} suggestions to improve your page.`,
      "success"
    );
  } catch (error) {
    console.error("ASSISTANT FAILED", error);
    showSnackbar("❌ Assistant failed. Please try again.", "error");
  } finally {
    setAiLoading(false);
  }
};

  // ===== RENDER =====

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 4,
          background:
            "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.10))",
          border: "1px solid #e5e7eb",
        }}
      >
        <Typography variant="h5" fontWeight={900}>
          🤖 AI Assistant
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Generate pages or get smart suggestions to improve your website.
        </Typography>
      </Box>

      {/* Input */}
      <Typography fontWeight={800} mb={1}>
        Describe what you want
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={6}
        placeholder="Create a modern restaurant homepage"
        value={aiPrompt}
        onChange={(e) => setAiPrompt(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            backgroundColor: "#ffffff",
          },
        }}
      />

      <Typography
        sx={{
          mt: 1,
          textAlign: "right",
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        {aiPrompt.length}/1000
      </Typography>

      {/* Buttons */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          fullWidth
          sx={{
            py: 1.6,
            borderRadius: 3,
            fontWeight: 900,
            textTransform: "none",
            background: "linear-gradient(135deg, #10b981, #06b6d4)",
            boxShadow: "0 12px 24px rgba(16,185,129,0.25)",
            "&:hover": {
              boxShadow: "0 16px 32px rgba(16,185,129,0.35)",
            },
          }}
          variant="contained"
          disabled={aiLoading}
          onClick={handleGeneratePage}
        >
          {aiLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "✨ Generate Page"
          )}
        </Button>

        <Button
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 900,
            textTransform: "none",
            borderColor: "#ddd",
            color: "#111827",
            backgroundColor: "#ffffff",
            "&:hover": {
              backgroundColor: "#f8fafc",
              borderColor: "#bbb",
            },
          }}
          variant="outlined"
          disabled={aiLoading || blocks.length === 0}
          onClick={handleAskAssistant}
        >
          {aiLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "💬 Ask Assistant"
          )}
        </Button>
      </Stack>

      {/* Info message when no blocks */}
      {blocks.length === 0 && (
        <Typography sx={{ mt: 1, fontSize: 12, color: "#94a3b8" }}>
          Generate a page first, then ask the assistant to analyze it.
        </Typography>
      )}

      {/* Suggestions */}
      {assistantReply && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Typography fontWeight={900}>Suggestions</Typography>
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: 999,
                bgcolor: "#dcfce7",
                color: "#059669",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {assistantReply.suggestions?.length || 0}
            </Box>
            <Chip
              size="small"
              label={`Category: ${assistantReply.category || "general"}`}
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0369a1",
                fontSize: 11,
                fontWeight: 700,
                height: 24,
              }}
            />
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
                    borderRadius: 3,
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    backgroundColor: "#ffffff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#10b981",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.10)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10b981",
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {item.action === "IMPROVE_HERO" && "🎨"}
                    {item.action === "ADD_SERVICES" && "📋"}
                    {item.action === "ADD_FAQ" && "❓"}
                    {item.action === "ADD_CTA" && "🚀"}
                    {item.action === "ADD_TESTIMONIALS" && "⭐"}
                    {item.action === "ADD_PRICING" && "💰"}
                    {!["IMPROVE_HERO", "ADD_SERVICES", "ADD_FAQ", "ADD_CTA", "ADD_TESTIMONIALS", "ADD_PRICING"].includes(
                      item.action
                    ) && "✨"}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={14} fontWeight={800}>
                      {item.title}
                    </Typography>

                    <Typography fontSize={12} color="#64748b" noWrap>
                      {item.description}
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    variant="text"
                    disabled={isApplying}
                    sx={{
                      fontWeight: 800,
                      textTransform: "none",
                      color: "#10b981",
                      "&:hover": {
                        backgroundColor: "rgba(16,185,129,0.08)",
                      },
                      "&.Mui-disabled": {
                        color: "#94a3b8",
                      },
                      flexShrink: 0,
                    }}
                    onClick={() => applySuggestion(item)}
                  >
                    {isApplying ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </Paper>
              );
            })}
          </Stack>

          {/* Assistant Reply */}
          <Typography fontWeight={900} mt={3} mb={1}>
            Assistant Reply
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "#f5f3ff",
              border: "1px solid #ddd6fe",
            }}
          >
            <Typography fontSize={14} color="#334155">
              🤖 {assistantReply.reply}
            </Typography>
          </Paper>

          <Typography
            sx={{
              mt: 2,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            🔒 Your data is used only to improve your website generation experience.
          </Typography>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssistantPanel;