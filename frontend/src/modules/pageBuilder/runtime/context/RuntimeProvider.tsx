import React, {
  createContext,
  useContext
} from "react";

// =========================
// TYPES
// =========================

export type RuntimeMode =
  | "editor"
  | "preview"
  | "public"
  | "export";

export type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export type CmsRuntimeContext = {
  collectionId: number;
  collectionSlug: string;
  entryId: number;
  entrySlug: string;
  data: Record<string, unknown>;
  fields: Array<{
    id: number;
    key: string;
    name: string;
    type: string;
  }>;
};

// =========================
// CONTEXT TYPE
// =========================

interface RuntimeContextValue {

  mode: RuntimeMode;

  device: Device;

  tokens?: any;

  siteId?: number | string | null;

  pageId?: number | string | null;

  cms?: CmsRuntimeContext;

  registerRuntimeNode?: (
    blockId: string,
    node: HTMLElement | null
  ) => void;
}

// =========================
// CONTEXT
// =========================

const RuntimeContext =
  createContext<
    RuntimeContextValue | undefined
  >(undefined);

// =========================
// PROVIDER
// =========================

interface RuntimeProviderProps {

  children: React.ReactNode;

  value: RuntimeContextValue;
}

export const RuntimeProvider = ({
  children,
  value
}: RuntimeProviderProps) => {

  return (

    <RuntimeContext.Provider
      value={value}
    >
      {children}
    </RuntimeContext.Provider>
  );
};

// =========================
// HOOK
// =========================

export const useRuntime = () => {

  const context =
    useContext(RuntimeContext);

  if (!context) {

    throw new Error(
      "useRuntime must be used inside RuntimeProvider"
    );
  }

  return context;
};
