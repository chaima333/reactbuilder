import {
  describe,
  expect,
  it
} from "vitest";

import {
  getPlatformAssistantWelcomeMessage
} from "./PlatformAssistantWidget";

describe("PlatformAssistantWidget welcome message", () => {
  it("uses a French welcome message for French locale", () => {
    const message =
      getPlatformAssistantWelcomeMessage("fr-FR");

    expect(message).toContain("Bonjour !");
    expect(message).toContain("Je peux vous aider à utiliser ReactBuilder");
    expect(message).toContain("les rôles");
    expect(message).toContain("le dépannage");
  });

  it("does not use the English welcome message for French locale", () => {
    const message =
      getPlatformAssistantWelcomeMessage("fr-FR");

    expect(message).not.toContain("Hi!");
    expect(message).not.toContain("Ask me about");
    expect(message).not.toContain("troubleshooting");
  });

  it("keeps the English welcome message for English locale", () => {
    const message =
      getPlatformAssistantWelcomeMessage("en-US");

    expect(message).toContain("Hi!");
    expect(message).toContain("Ask me about sites");
  });
});
