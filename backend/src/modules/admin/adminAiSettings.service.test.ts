import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  create: vi.fn()
}));

vi.mock("../../models", () => ({
  PlatformSetting: {
    findOne: mocks.findOne,
    create: mocks.create
  }
}));

import {
  AdminAiSettingsService
} from "./adminAiSettings.service";
import {
  AiProviderFactory
} from "../ia/providers/aiProvider.factory";
import {
  authorizeRoles
} from "../../core/middleware/role.middleware";

const originalEnv =
  process.env;

const createSettingRecord = (
  value: Record<string, any>
) => ({
  value,
  createdAt:
    new Date("2026-01-01T00:00:00.000Z"),
  updatedAt:
    new Date("2026-01-02T00:00:00.000Z"),
  update: vi.fn(async function update(
    this: any,
    payload: Record<string, any>
  ) {
    this.value =
      payload.value;
    this.updatedAt =
      new Date("2026-01-03T00:00:00.000Z");
    return this;
  })
});

const makeResponse = () => {
  const res: any = {
    statusCode: 200,
    body: null,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((body: any) => {
      res.body = body;
      return res;
    })
  };

  return res;
};

describe("platform AI settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv
    };
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_MODEL;
    delete process.env.OPENAI_MODEL;
    delete process.env.GEMINI_MODEL;
    delete process.env.AI_PROVIDER;
    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_ENABLED;
  });

  it("admin settings service can read persisted AI settings without leaking API keys", async () => {
    process.env.OPENAI_API_KEY =
      "sk-secret-openai";
    process.env.OPENAI_MODEL =
      "gpt-test";

    mocks.findOne.mockResolvedValue(
      createSettingRecord({
        enabled: true,
        provider: "openai",
        model: "gpt-test",
        globalAssistantEnabled: true,
        builderAiEnabled: false,
        updatedBy: 7
      })
    );

    const settings =
      await AdminAiSettingsService.getSettings();

    expect(settings.provider).toBe("openai");
    expect(settings.model).toBe("gpt-test");
    expect(settings.builderAiEnabled).toBe(false);
    expect(settings.providerStatus.openai.configured).toBe(true);
    expect(JSON.stringify(settings)).not.toContain("sk-secret-openai");
  });

  it("admin settings service can update AI settings", async () => {
    process.env.OPENAI_API_KEY =
      "configured";

    const record =
      createSettingRecord({
        enabled: false,
        provider: "gemini",
        model: "gemini-2.0-flash",
        globalAssistantEnabled: true,
        builderAiEnabled: true,
        updatedBy: null
      });

    mocks.findOne.mockResolvedValue(
      record
    );

    const updated =
      await AdminAiSettingsService.saveSettings(
        {
          enabled: true,
          provider: "openai",
          model: "gpt-4.1-mini",
          globalAssistantEnabled: false,
          builderAiEnabled: true
        },
        42
      );

    expect(record.update).toHaveBeenCalledWith({
      value: expect.objectContaining({
        enabled: true,
        provider: "openai",
        model: "gpt-4.1-mini",
        globalAssistantEnabled: false,
        builderAiEnabled: true,
        updatedBy: 42
      })
    });
    expect(updated.updatedBy).toBe(42);
  });

  it("non-admin users cannot pass the admin role guard", () => {
    const middleware =
      authorizeRoles("ADMIN");
    const res =
      makeResponse();
    const next =
      vi.fn();

    middleware(
      {
        user: {
          role: "EDITOR"
        }
      } as any,
      res,
      next
    );

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects unsupported providers", async () => {
    mocks.findOne.mockResolvedValue(
      null
    );

    await expect(
      AdminAiSettingsService.saveSettings(
        {
          enabled: true,
          provider: "mistral" as any
        },
        1
      )
    ).rejects.toThrow("Unsupported AI provider");
  });

  it("allows disabled AI state even when the selected provider is unavailable", async () => {
    mocks.findOne.mockResolvedValue(
      null
    );
    mocks.create.mockImplementation(
      async (payload: any) =>
        createSettingRecord(payload.value)
    );

    const settings =
      await AdminAiSettingsService.saveSettings(
        {
          enabled: false,
          provider: "claude",
          model: "claude-sonnet-5"
        },
        3
      );

    expect(settings.enabled).toBe(false);
    expect(settings.provider).toBe("claude");
    expect(settings.providerStatus.claude.configured).toBe(false);
  });

  it("rejects enabled providers without a configured server API key", async () => {
    mocks.findOne.mockResolvedValue(
      null
    );

    await expect(
      AdminAiSettingsService.saveSettings(
        {
          enabled: true,
          provider: "claude",
          model: "claude-sonnet-5"
        },
        3
      )
    ).rejects.toThrow("claude is not configured on the server");
  });

  it("provider factory resolves the selected persisted provider", async () => {
    process.env.OPENAI_API_KEY =
      "configured";
    mocks.findOne.mockResolvedValue(
      createSettingRecord({
        enabled: true,
        provider: "openai",
        model: "gpt-4.1-mini",
        globalAssistantEnabled: true,
        builderAiEnabled: true,
        updatedBy: 1
      })
    );

    const provider =
      await AiProviderFactory.getActiveAiProvider();

    expect(provider).toEqual({
      name: "openai",
      model: "gpt-4.1-mini",
      configured: true
    });
  });

  it("provider factory returns null when platform AI is disabled", async () => {
    mocks.findOne.mockResolvedValue(
      createSettingRecord({
        enabled: false,
        provider: "gemini",
        model: "gemini-2.0-flash",
        globalAssistantEnabled: true,
        builderAiEnabled: true,
        updatedBy: 1
      })
    );

    await expect(
      AiProviderFactory.getActiveAiProvider()
    ).resolves.toBeNull();
  });
});
