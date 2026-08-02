import {
  describe,
  expect,
  it,
} from "vitest";
import {
  DashboardLayout,
  DashboardWidget,
} from "../types/dashboard.types";
import {
  getDefaultDashboardLayout,
} from "./defaultDashboardLayout";

const widget = (
  id: string,
  type: string,
  col: number,
  order: number
): DashboardWidget => ({
  id,
  type,
  col,
  order,
  enabled: true,
  payload: null,
});

const blockSummary = (layout: DashboardLayout) =>
  layout.blocks.map((block) => ({
    type: block.type,
    col: block.col,
    order: block.order,
  }));

describe("getDefaultDashboardLayout", () => {
  it("uses the improved default layout when there is no saved layout", () => {
    const layout = getDefaultDashboardLayout(null, [
      widget("version-plugin", "widget.version.summary", 6, 1),
      widget("seo-plugin", "widget.seo.score", 6, 2),
      widget("media", "widget.media.summary", 6, 2),
      widget("notification-plugin", "notifications", 4, 3),
      widget("ai-history-plugin", "widget.ai.history", 12, 90),
    ]);

    expect(blockSummary(layout)).toEqual([
      { type: "stats", col: 12, order: 0 },
      { type: "chart", col: 12, order: 10 },
      { type: "widget.version.summary", col: 6, order: 20 },
      { type: "activity", col: 6, order: 30 },
      { type: "widget.seo.score", col: 6, order: 40 },
      { type: "widget.media.summary", col: 6, order: 50 },
      { type: "notifications", col: 6, order: 60 },
      { type: "widget.ai.history", col: 6, order: 70 },
    ]);
  });

  it("normalizes an existing saved legacy default layout", () => {
    const legacyLayout: DashboardLayout = {
      blocks: [
        { id: "stats-core", type: "stats", col: 12, order: 0 },
        { id: "chart-core", type: "chart", col: 8, order: 1 },
        { id: "activity-core", type: "activity", col: 4, order: 2 },
        { id: "version-plugin", type: "widget.version.summary", col: 6, order: 1 },
        { id: "seo-plugin", type: "widget.seo.score", col: 6, order: 2 },
        { id: "media", type: "widget.media.summary", col: 6, order: 2 },
        { id: "notification-plugin", type: "notifications", col: 4, order: 3 },
        { id: "ai-history-plugin", type: "widget.ai.history", col: 12, order: 90 },
      ],
    };

    expect(blockSummary(getDefaultDashboardLayout(legacyLayout))).toEqual([
      { type: "stats", col: 12, order: 0 },
      { type: "chart", col: 12, order: 10 },
      { type: "widget.version.summary", col: 6, order: 20 },
      { type: "activity", col: 6, order: 30 },
      { type: "widget.seo.score", col: 6, order: 40 },
      { type: "widget.media.summary", col: 6, order: 50 },
      { type: "notifications", col: 6, order: 60 },
      { type: "widget.ai.history", col: 6, order: 70 },
    ]);
  });

  it("preserves non-legacy custom layout values", () => {
    const customLayout: DashboardLayout = {
      blocks: [
        { id: "stats-core", type: "stats", col: 12, order: 0 },
        { id: "chart-core", type: "chart", col: 6, order: 5 },
        { id: "activity-core", type: "activity", col: 6, order: 6 },
      ],
    };

    expect(blockSummary(getDefaultDashboardLayout(customLayout))).toEqual([
      { type: "stats", col: 12, order: 0 },
      { type: "chart", col: 6, order: 5 },
      { type: "activity", col: 6, order: 6 },
    ]);
  });
});
