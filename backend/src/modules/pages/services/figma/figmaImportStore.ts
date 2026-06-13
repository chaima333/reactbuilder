// backend/src/modules/pages/services/figma/figmaImportStore.ts

import crypto from "crypto";

type StoredFigmaImport = {
  id: string;
  payload: any;
  source: string;
  createdAt: number;
};

const store = new Map<string, StoredFigmaImport>();

export const saveFigmaImportPayload = (
  payload: any,
  source = "figma-plugin"
): string => {
  const id = crypto.randomUUID();

  store.set(id, {
    id,
    payload,
    source,
    createdAt: Date.now()
  });

  return id;
};

export const getFigmaImportPayload = (
  id: string
): StoredFigmaImport | null => {
  return store.get(id) || null;
};