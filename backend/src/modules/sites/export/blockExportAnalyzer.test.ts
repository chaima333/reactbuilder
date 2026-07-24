import {
  describe,
  expect,
  it,
} from "vitest";

import {
  analyzeBlockExportCapabilities,
} from "./blockExportAnalyzer";

const block = (
  type: string,
  children: unknown[] = []
) => ({
  id: type,
  type,
  data: {
    props: {},
    style: {},
  },
  children,
});

describe("block export capability analyzer", () => {
  it("detects visitorLogin client runtime requirements", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("visitorLogin"),
      ]);

    expect(analysis.runtimeRequired).toBe(true);
    expect(analysis.clientRuntimeBlockTypes).toEqual([
      "visitorLogin",
    ]);
    expect(analysis.runtimeModules).toEqual([
      "visitorAuth",
    ]);
    expect(analysis.requiredBackendCapabilities).toEqual([
      "visitorAuth",
    ]);
    expect(analysis.dynamicBlocks).toEqual([
      {
        type: "visitorLogin",
        mode: "clientRuntime",
        fallback: "disabled",
        backendRequired: [
          "visitorAuth",
        ],
        runtimeModule: "visitorAuth",
      },
    ]);
  });

  it("detects visitorRegister client runtime requirements", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("visitorRegister"),
      ]);

    expect(analysis.runtimeRequired).toBe(true);
    expect(analysis.clientRuntimeBlockTypes).toEqual([
      "visitorRegister",
    ]);
    expect(analysis.runtimeModules).toEqual([
      "visitorAuth",
    ]);
    expect(analysis.requiredBackendCapabilities).toEqual([
      "visitorAuth",
    ]);
    expect(analysis.dynamicBlocks[0]).toMatchObject({
      type: "visitorRegister",
      mode: "clientRuntime",
      fallback: "disabled",
      runtimeModule: "visitorAuth",
    });
  });

  it("detects form client runtime requirements", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("form"),
      ]);

    expect(analysis.runtimeRequired).toBe(true);
    expect(analysis.clientRuntimeBlockTypes).toEqual([
      "form",
    ]);
    expect(analysis.runtimeModules).toEqual([
      "forms",
    ]);
    expect(analysis.requiredBackendCapabilities).toEqual([
      "forms",
    ]);
    expect(analysis.fallbacks).toEqual([
      "disabled",
    ]);
  });

  it("detects collectionList server snapshots without requiring client runtime", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("collectionList"),
      ]);

    expect(analysis.runtimeRequired).toBe(false);
    expect(analysis.clientRuntimeBlockTypes).toEqual([]);
    expect(analysis.runtimeModules).toEqual([]);
    expect(analysis.requiredBackendCapabilities).toEqual([
      "cms",
    ]);
    expect(analysis.exportModes).toEqual([
      "serverSnapshot",
    ]);
    expect(analysis.fallbacks).toEqual([
      "snapshot",
    ]);
    expect(analysis.dynamicBlocks[0]).toMatchObject({
      type: "collectionList",
      mode: "serverSnapshot",
      fallback: "snapshot",
    });
  });

  it("recursively detects nested dynamic blocks", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("section", [
          block("grid", [
            block("gridItem", [
              block("visitorLogin"),
            ]),
          ]),
        ]),
      ]);

    expect(analysis.runtimeRequired).toBe(true);
    expect(analysis.clientRuntimeBlockTypes).toEqual([
      "visitorLogin",
    ]);
    expect(analysis.dynamicBlocks).toHaveLength(1);
  });

  it("removes duplicate capabilities and runtime modules", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("visitorLogin"),
        block("visitorRegister"),
        block("form"),
        block("form"),
      ]);

    expect(analysis.runtimeRequired).toBe(true);
    expect(analysis.runtimeModules).toEqual([
      "forms",
      "visitorAuth",
    ]);
    expect(analysis.requiredBackendCapabilities).toEqual([
      "forms",
      "visitorAuth",
    ]);
    expect(analysis.clientRuntimeBlockTypes).toEqual([
      "form",
      "visitorLogin",
      "visitorRegister",
    ]);
    expect(analysis.dynamicBlocks).toHaveLength(3);
  });

  it("defaults missing metadata to static", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("futureStaticBlock"),
      ]);

    expect(analysis).toEqual({
      runtimeRequired: false,
      clientRuntimeBlockTypes: [],
      runtimeModules: [],
      requiredBackendCapabilities: [],
      exportModes: [],
      fallbacks: [],
      dynamicBlocks: [],
    });
  });

  it("does not require runtime for ordinary static pages", () => {
    const analysis =
      analyzeBlockExportCapabilities([
        block("section", [
          block("title"),
          block("text"),
          block("image"),
        ]),
      ]);

    expect(analysis.runtimeRequired).toBe(false);
    expect(analysis.runtimeModules).toEqual([]);
    expect(analysis.requiredBackendCapabilities).toEqual([]);
    expect(analysis.dynamicBlocks).toEqual([]);
  });
});
