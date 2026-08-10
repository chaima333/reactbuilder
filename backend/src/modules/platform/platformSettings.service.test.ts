import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  findOne: vi.fn()
}));

vi.mock("../../models", () => ({
  PlatformSetting: {
    findOne: mocks.findOne
  }
}));

import {
  PlatformSettingsService
} from "./platformSettings.service";

describe("public platform settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes safe AI runtime flags without provider configuration", async () => {
    mocks.findOne.mockImplementation(
      async ({ where }: any) => {
        if (where.key === "platform") {
          return {
            value: {
              platformName: "ReactBuilder",
              aiEnabled: true
            }
          };
        }

        if (where.key === "platform_ai") {
          return {
            value: {
              enabled: false,
              provider: "openai",
              model: "gpt-secret",
              globalAssistantEnabled: true,
              builderAiEnabled: false
            }
          };
        }

        return null;
      }
    );

    const settings =
      await PlatformSettingsService.getPublicSettings();

    expect(settings.aiEnabled).toBe(false);
    expect(settings.globalAssistantEnabled).toBe(true);
    expect(settings.builderAiEnabled).toBe(false);
    expect(settings).not.toHaveProperty("provider");
    expect(settings).not.toHaveProperty("model");
  });
});
