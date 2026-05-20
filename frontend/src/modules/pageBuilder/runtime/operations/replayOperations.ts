import type { PageData } from "../../types/page.types";
import { dispatchOperation } from "./dispatchOperation";
import type { Operation } from "./types";

export type ReplayResult = {
  page: PageData;
  applied: Operation[];
};

export const replayOperations = (
  initialPage: PageData,
  operations: Operation[]
): ReplayResult => {
  const page = operations.reduce(
    (currentPage, operation) => dispatchOperation(currentPage, operation),
    structuredClone(initialPage)
  );

  return {
    page,
    applied: [...operations]
  };
};

export const replayUndo = (
  initialPage: PageData,
  operations: Operation[]
): ReplayResult => {
  return replayOperations(initialPage, operations.slice(0, -1));
};

export const replayRedo = (
  page: PageData,
  operation: Operation
): ReplayResult => {
  return replayOperations(page, [operation]);
};
