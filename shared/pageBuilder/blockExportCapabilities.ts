export type SharedBlockExportMode =
  | "static"
  | "clientRuntime"
  | "serverSnapshot"
  | "unsupported";

export type SharedBlockBackendCapability =
  | "visitorAuth"
  | "forms"
  | "cms";

export type SharedBlockExportFallback =
  | "placeholder"
  | "disabled"
  | "snapshot"
  | "omit";

export type SharedBlockExportConfig = {
  mode: SharedBlockExportMode;
  backendRequired?: SharedBlockBackendCapability[];
  fallback?: SharedBlockExportFallback;
  runtimeModule?: string;
};

export const blockExportCapabilities = {
  visitorLogin: {
    mode: "clientRuntime",
    backendRequired: [
      "visitorAuth",
    ],
    fallback: "disabled",
    runtimeModule: "visitorAuth",
  },

  visitorRegister: {
    mode: "clientRuntime",
    backendRequired: [
      "visitorAuth",
    ],
    fallback: "disabled",
    runtimeModule: "visitorAuth",
  },

  form: {
    mode: "clientRuntime",
    backendRequired: [
      "forms",
    ],
    fallback: "disabled",
    runtimeModule: "forms",
  },

  collectionList: {
    mode: "serverSnapshot",
    backendRequired: [
      "cms",
    ],
    fallback: "snapshot",
  },
} as const satisfies Record<string, SharedBlockExportConfig>;

export type ExportCapabilityBlockType =
  keyof typeof blockExportCapabilities;

export const getBlockExportCapability = (
  blockType: unknown
): SharedBlockExportConfig | undefined => {
  if (typeof blockType !== "string") {
    return undefined;
  }

  return blockExportCapabilities[
    blockType as ExportCapabilityBlockType
  ];
};
