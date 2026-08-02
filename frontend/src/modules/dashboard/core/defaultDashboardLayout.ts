import {
  DashboardBlock,
  DashboardLayout,
  DashboardWidget,
} from "../types/dashboard.types";

const DEFAULT_DASHBOARD_BLOCKS: DashboardBlock[] = [
  { id: "stats-core", type: "stats", col: 12, order: 0 },
  { id: "chart-core", type: "chart", col: 12, order: 10 },
  { id: "version-plugin", type: "widget.version.summary", col: 6, order: 20 },
  { id: "activity-core", type: "activity", col: 6, order: 30 },
  { id: "seo-plugin", type: "widget.seo.score", col: 6, order: 40 },
  { id: "media", type: "widget.media.summary", col: 6, order: 50 },
  { id: "notification-plugin", type: "notifications", col: 6, order: 60 },
  { id: "ai-history-plugin", type: "widget.ai.history", col: 6, order: 70 },
];

const LEGACY_DASHBOARD_BLOCKS: DashboardBlock[] = [
  { id: "stats-core", type: "stats", col: 12, order: 0 },
  { id: "chart-core", type: "chart", col: 8, order: 1 },
  { id: "activity-core", type: "activity", col: 4, order: 2 },
  { id: "version-plugin", type: "widget.version.summary", col: 6, order: 1 },
  { id: "seo-plugin", type: "widget.seo.score", col: 6, order: 2 },
  { id: "media", type: "widget.media.summary", col: 6, order: 2 },
  { id: "notification-plugin", type: "notifications", col: 4, order: 3 },
  { id: "ai-history-plugin", type: "widget.ai.history", col: 12, order: 90 },
];

const defaultBlockByType = new Map(
  DEFAULT_DASHBOARD_BLOCKS.map((block) => [block.type, block])
);

const legacyBlockByType = new Map(
  LEGACY_DASHBOARD_BLOCKS.map((block) => [block.type, block])
);

const isCoreBlock = (block: DashboardBlock) =>
  block.type === "stats" || block.type === "chart" || block.type === "activity";

const isLegacyDefaultBlock = (block: DashboardBlock) => {
  const legacyBlock = legacyBlockByType.get(block.type);

  return (
    !!legacyBlock &&
    block.col === legacyBlock.col &&
    (block.order ?? 0) === legacyBlock.order
  );
};

const normalizeLegacyDefaultBlock = (block: DashboardBlock) => {
  const defaultBlock = defaultBlockByType.get(block.type);

  if (!defaultBlock || !isLegacyDefaultBlock(block)) {
    return block;
  }

  return {
    ...block,
    col: defaultBlock.col,
    order: defaultBlock.order,
  };
};

const removeExistingBlockOfType = (
  blocksById: Map<string, DashboardBlock>,
  type: string,
  nextId: string
) => {
  blocksById.forEach((block, id) => {
    if (block.type === type && id !== nextId) {
      blocksById.delete(id);
    }
  });
};

export const getDefaultDashboardLayout = (
  layout?: DashboardLayout | null,
  widgets: DashboardWidget[] = []
): DashboardLayout => {
  const blocksById = new Map<string, DashboardBlock>();

  DEFAULT_DASHBOARD_BLOCKS.filter(isCoreBlock).forEach((block) => {
    blocksById.set(block.id, block);
  });

  layout?.blocks?.forEach((block) => {
    removeExistingBlockOfType(blocksById, block.type, block.id);

    blocksById.set(block.id, normalizeLegacyDefaultBlock(block));
  });

  widgets
    .filter((widget) => widget.enabled !== false)
    .forEach((widget, index) => {
      const existingBlock = Array.from(blocksById.values()).find(
        (block) => block.id === widget.id || block.type === widget.type
      );
      const blockId = existingBlock?.id ?? widget.id;
      const widgetBlock: DashboardBlock = {
        id: blockId,
        type: widget.type,
        col: existingBlock?.col ?? widget.col ?? 6,
        order: existingBlock?.order ?? widget.order ?? 100 + index,
      };

      removeExistingBlockOfType(blocksById, widget.type, blockId);

      blocksById.set(blockId, normalizeLegacyDefaultBlock(widgetBlock));
    });

  return {
    blocks: Array.from(blocksById.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    ),
  };
};
