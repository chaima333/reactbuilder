import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

vi.mock(
  "../../../models/AiActivityEvent",
  () => ({
    AiActivityEvent: {
      findAll: vi.fn()
    }
  })
);

import {
  AiActivityEvent
} from "../../../models/AiActivityEvent";

import {
  getAiAnalyticsSummary
} from "../analytics/aiAnalytics.service";

const mockFindAll =
  vi.mocked(
    AiActivityEvent.findAll
  );

describe("AI analytics summary", () => {
  beforeEach(() => {
    mockFindAll.mockReset();
  });

  it("counts telemetry and feedback correctly", async () => {
    mockFindAll.mockResolvedValue([
      {
        id: 1,
        siteId: 369,
        userId: 4,
        pageId: 10,
        eventType: "DESIGN_COPILOT_CHAT",
        createdAt: new Date("2026-07-07T10:00:00Z"),
        details: {
          suggestionTitle: "Improve navbar",
          aiTelemetry: {
            task: "DESIGN_COPILOT_CHAT",
            provider: "fallback",
            model: "gemini-2.0-flash",
            success: false,
            usedFallback: true,
            fallbackReason: "LLM_DISABLED",
            durationMs: 0
          }
        }
      },
      {
        id: 2,
        siteId: 369,
        userId: 4,
        pageId: 11,
        eventType: "AI_PAGE_GENERATED",
        createdAt: new Date("2026-07-07T10:01:00Z"),
        details: {
          title: "CyberShield Academy",
          aiTelemetry: {
            task: "PAGE_GENERATION",
            provider: "gemini",
            model: "gemini-2.0-flash",
            success: true,
            usedFallback: false,
            fallbackReason: null,
            durationMs: 120
          }
        }
      },
      {
        id: 3,
        siteId: 369,
        userId: 4,
        pageId: null,
        eventType: "AI_FEEDBACK",
        createdAt: new Date("2026-07-07T10:02:00Z"),
        details: {
          rating: "positive"
        }
      },
      {
        id: 4,
        siteId: 369,
        userId: 4,
        pageId: null,
        eventType: "AI_FEEDBACK",
        createdAt: new Date("2026-07-07T10:03:00Z"),
        details: {
          rating: "negative"
        }
      }
    ] as any);

    const summary =
      await getAiAnalyticsSummary(
        369
      );

    expect(summary.totals.totalEvents).toBe(4);
    expect(summary.totals.telemetryEvents).toBe(2);

    expect(summary.totals.successCount).toBe(1);
    expect(summary.totals.failedCount).toBe(1);

    expect(summary.totals.fallbackCount).toBe(1);
    expect(summary.totals.fallbackRate).toBe(50);

    expect(summary.totals.feedbackEvents).toBe(2);
    expect(summary.totals.positiveFeedback).toBe(1);
    expect(summary.totals.negativeFeedback).toBe(1);
    expect(summary.totals.feedbackRate).toBe(50);
    expect(summary.totals.positiveFeedbackRate).toBe(50);
    expect(summary.totals.negativeFeedbackRate).toBe(50);
  });

  it("excludes AI_FEEDBACK from recent AI events", async () => {
    mockFindAll.mockResolvedValue([
      {
        id: 1,
        siteId: 369,
        userId: 4,
        pageId: null,
        eventType: "AI_FEEDBACK",
        createdAt: new Date("2026-07-07T10:00:00Z"),
        details: {
          rating: "positive"
        }
      },
      {
        id: 2,
        siteId: 369,
        userId: 4,
        pageId: 15,
        eventType: "DESIGN_COPILOT_APPLY",
        createdAt: new Date("2026-07-07T10:01:00Z"),
        details: {
          suggestionTitle: "Improve navbar",
          actionsCount: 1
        }
      }
    ] as any);

    const summary =
      await getAiAnalyticsSummary(
        369
      );

    expect(
      summary.recentEvents.some(
        (event) =>
          event.eventType === "AI_FEEDBACK"
      )
    ).toBe(false);

    expect(summary.recentEvents).toHaveLength(1);
    expect(summary.recentEvents[0].eventType).toBe(
      "DESIGN_COPILOT_APPLY"
    );
  });
});