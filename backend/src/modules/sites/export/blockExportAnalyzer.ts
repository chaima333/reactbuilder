import {
  getBlockExportCapability,
  SharedBlockExportConfig,
  SharedBlockExportFallback,
  SharedBlockExportMode,
} from "../../../shared/pageBuilder/blockExportCapabilities.generated";

export type DynamicExportBlock = {
  type: string;
  mode: SharedBlockExportMode;
  fallback?: SharedBlockExportFallback;
  backendRequired: string[];
  runtimeModule?: string;
};

export type BlockExportAnalysis = {
  runtimeRequired: boolean;
  clientRuntimeBlockTypes: string[];
  runtimeModules: string[];
  requiredBackendCapabilities: string[];
  exportModes: SharedBlockExportMode[];
  fallbacks: SharedBlockExportFallback[];
  dynamicBlocks: DynamicExportBlock[];
};

const createEmptyAnalysis = (): BlockExportAnalysis => ({
  runtimeRequired: false,
  clientRuntimeBlockTypes: [],
  runtimeModules: [],
  requiredBackendCapabilities: [],
  exportModes: [],
  fallbacks: [],
  dynamicBlocks: [],
});

const uniqueSorted = <T extends string>(
  values: Iterable<T>
): T[] =>
  Array.from(new Set(values)).sort();

const dynamicBlockKey = (
  block: DynamicExportBlock
): string =>
  [
    block.type,
    block.mode,
    block.fallback || "",
    block.runtimeModule || "",
    block.backendRequired.join(","),
  ].join("|");

const toDynamicExportBlock = (
  type: string,
  config: SharedBlockExportConfig
): DynamicExportBlock => ({
  type,
  mode: config.mode,
  fallback: config.fallback,
  backendRequired: [
    ...(config.backendRequired || []),
  ],
  runtimeModule: config.runtimeModule,
});

export const mergeBlockExportAnalysis = (
  analyses: BlockExportAnalysis[]
): BlockExportAnalysis => {
  const dynamicBlocksByKey =
    new Map<string, DynamicExportBlock>();

  for (const analysis of analyses) {
    for (const block of analysis.dynamicBlocks) {
      dynamicBlocksByKey.set(
        dynamicBlockKey(block),
        block
      );
    }
  }

  const dynamicBlocks =
    Array.from(dynamicBlocksByKey.values())
      .sort((left, right) =>
        left.type.localeCompare(right.type) ||
        left.mode.localeCompare(right.mode)
      );

  return {
    runtimeRequired:
      analyses.some((analysis) =>
        analysis.runtimeRequired
      ),

    clientRuntimeBlockTypes:
      uniqueSorted(
        analyses.flatMap((analysis) =>
          analysis.clientRuntimeBlockTypes
        )
      ),

    runtimeModules:
      uniqueSorted(
        analyses.flatMap((analysis) =>
          analysis.runtimeModules
        )
      ),

    requiredBackendCapabilities:
      uniqueSorted(
        analyses.flatMap((analysis) =>
          analysis.requiredBackendCapabilities
        )
      ),

    exportModes:
      uniqueSorted(
        analyses.flatMap((analysis) =>
          analysis.exportModes
        )
      ),

    fallbacks:
      uniqueSorted(
        analyses.flatMap((analysis) =>
          analysis.fallbacks
        )
      ),

    dynamicBlocks,
  };
};

export const analyzeBlockExportCapabilities = (
  blocks: unknown
): BlockExportAnalysis => {
  if (!Array.isArray(blocks)) {
    return createEmptyAnalysis();
  }

  const analyses: BlockExportAnalysis[] = [];

  for (const block of blocks) {
    if (
      !block ||
      typeof block !== "object"
    ) {
      continue;
    }

    const record =
      block as Record<string, unknown>;

    const type =
      typeof record.type === "string"
        ? record.type
        : "";

    const config =
      getBlockExportCapability(type);

    const childAnalysis =
      analyzeBlockExportCapabilities(
        record.children
      );

    if (!config) {
      analyses.push(childAnalysis);
      continue;
    }

    const blockAnalysis =
      createEmptyAnalysis();

    blockAnalysis.exportModes = [
      config.mode,
    ];

    if (config.fallback) {
      blockAnalysis.fallbacks = [
        config.fallback,
      ];
    }

    blockAnalysis.requiredBackendCapabilities =
      uniqueSorted(
        config.backendRequired || []
      );

    blockAnalysis.dynamicBlocks = [
      toDynamicExportBlock(
        type,
        config
      ),
    ];

    if (config.mode === "clientRuntime") {
      blockAnalysis.runtimeRequired = true;
      blockAnalysis.clientRuntimeBlockTypes = [
        type,
      ];

      if (config.runtimeModule) {
        blockAnalysis.runtimeModules = [
          config.runtimeModule,
        ];
      }
    }

    analyses.push(
      mergeBlockExportAnalysis([
        blockAnalysis,
        childAnalysis,
      ])
    );
  }

  return mergeBlockExportAnalysis(
    analyses
  );
};
