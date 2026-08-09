import { describe, expect, it } from "vitest";
import {
  askAssistant,
  editBlockWithAssistant
} from "./assistant.service";
import { isObviousConversationalPrompt } from "./assistant.intent";

const sampleBlocks = [
  {
    id: "hero-section",
    type: "section",
    data: {
      props: {},
      style: {
        desktop: {},
        tablet: {},
        mobile: {}
      }
    },
    children: [
      {
        id: "hero-title",
        type: "title",
        data: {
          props: {
            text: "Short title",
            content: "Short title"
          },
          style: {
            desktop: {},
            tablet: {},
            mobile: {}
          }
        },
        children: []
      }
    ]
  }
];

describe("assistant service intent handling", () => {
  it.each([
    "bonjour",
    "salut",
    "hello",
    "hi",
    "bonsoir"
  ])("%s returns a message without suggestions", async (prompt) => {
    const before = JSON.stringify(sampleBlocks);
    const result = await askAssistant({
      prompt,
      blocks: sampleBlocks,
      pageTitle: "Home"
    });

    expect(result.kind).toBe("message");
    expect(result.intent).toBe("GREETING");
    expect(result.suggestions).toEqual([]);
    expect(JSON.stringify(sampleBlocks)).toBe(before);
  });

  it("merci returns normal conversation without mutation", async () => {
    const before = JSON.stringify(sampleBlocks);
    const result = await askAssistant({
      prompt: "merci",
      blocks: sampleBlocks
    });

    expect(result.kind).toBe("message");
    expect(result.intent).toBe("GENERAL_CONVERSATION");
    expect(result.suggestions).toEqual([]);
    expect(JSON.stringify(sampleBlocks)).toBe(before);
  });

  it("help question returns a non-mutating builder-help message", async () => {
    const result = await askAssistant({
      prompt: "que peux-tu faire ?",
      blocks: sampleBlocks
    });

    expect(result.kind).toBe("message");
    expect(result.intent).toBe("BUILDER_HELP");
    expect(result.suggestions).toEqual([]);
    expect(result.reply).toContain("ReactBuilder");
  });

  it("builder how-to questions do not become content mutations", async () => {
    const result = await askAssistant({
      prompt: "comment ajouter un formulaire ?",
      blocks: sampleBlocks
    });

    expect(result.kind).toBe("message");
    expect(result.intent).toBe("BUILDER_HELP");
    expect(result.suggestions).toEqual([]);
  });

  it("change ca without selected block asks for clarification", async () => {
    const result = await askAssistant({
      prompt: "change ça",
      blocks: sampleBlocks,
      selectedBlockId: null
    });

    expect(result.kind).toBe("clarification");
    expect(result.intent).toBe("CLARIFICATION_REQUIRED");
    expect(result.suggestions).toEqual([]);
  });

  it("obvious conversation is blocked from generation guards", () => {
    expect(isObviousConversationalPrompt("bonjour")).toBe(true);
    expect(isObviousConversationalPrompt("hello")).toBe(true);
  });

  it("obvious conversation is blocked from selected-block editing", async () => {
    await expect(
      editBlockWithAssistant({
        prompt: "bonjour",
        block: {
          id: "button-1",
          type: "button",
          data: {
            props: {
              label: "Start"
            },
            style: {
              desktop: {},
              tablet: {},
              mobile: {}
            }
          },
          children: []
        }
      })
    ).rejects.toThrow("CONVERSATIONAL_PROMPT_NOT_EDITABLE");
  });

  it("existing page suggestions still work", async () => {
    const result = await askAssistant({
      prompt: "Analyze this page and suggest improvements.",
      blocks: sampleBlocks,
      pageTitle: "Home"
    });

    expect(result.kind).toBe("suggestions");
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(
      result.suggestions.map((suggestion) => suggestion.action)
    ).toContain("ADD_FAQ");
  });

  it("existing selected-block edit still works", async () => {
    const result = await editBlockWithAssistant({
      prompt: "make this button more modern",
      block: {
        id: "button-1",
        type: "button",
        data: {
          props: {
            label: "Start"
          },
          style: {
            desktop: {},
            tablet: {},
            mobile: {}
          }
        },
        children: []
      }
    });

    expect(result.block.type).toBe("button");
    expect(result.block.data.style.desktop.backgroundColor).toBe("#2563eb");
  });
});
