import { describe, expect, it } from "vitest";
import {
  getConversationalAssistantMessage,
  isObviousConversationalPrompt
} from "./assistantIntent";

describe("assistant prompt guards", () => {
  it.each([
    "bonjour",
    "salut",
    "hello",
    "hi",
    "bonsoir"
  ])("%s is treated as conversation, not generation", (prompt) => {
    expect(isObviousConversationalPrompt(prompt)).toBe(true);
  });

  it.each([
    "merci",
    "que peux-tu faire ?"
  ])("%s is treated as conversation, not block editing", (prompt) => {
    expect(isObviousConversationalPrompt(prompt)).toBe(true);
  });

  it("does not block legitimate page generation prompts", () => {
    expect(
      isObviousConversationalPrompt(
        "cree une landing page pour mon agence"
      )
    ).toBe(false);
  });

  it("returns a non-greeting message for thanks", () => {
    expect(
      getConversationalAssistantMessage("merci")
    ).toContain("Avec plaisir");
  });
});
