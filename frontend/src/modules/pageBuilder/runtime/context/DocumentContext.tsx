// frontend/src/modules/pageBuilder/runtime/context/DocumentContext.tsx
import React, { createContext, useContext, useState } from "react";
import { PageData } from "../../types/page.types";
import { Operation, OperationDraft } from "../operations/types";
import { dispatchOperation } from "../operations/dispatchOperation";

interface DocumentContextValue {
  pageData: PageData;
  history: { past: Operation[]; future: Operation[] };
  executeOperation: (opWithoutMeta: OperationDraft) => void;
  undo: () => void;
  redo: () => void;
}

const DocumentContext = createContext<DocumentContextValue | undefined>(undefined);

export const DocumentProvider = ({ children, initialData }: { children: React.ReactNode; initialData: PageData }) => {
  const [pageData, setPageData] = useState<PageData>(initialData);
  const [history, setHistory] = useState<{ past: Operation[]; future: Operation[] }>({ past: [], future: [] });

  const executeOperation = (opWithoutMeta: OperationDraft) => {
    const fullOperation: Operation = {
      ...opWithoutMeta,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    } as Operation;

    const nextState = dispatchOperation(pageData, fullOperation);
    
    setPageData(nextState);
    setHistory((prev) => ({
      past: [...prev.past, fullOperation],
      future: [],
    }));
  };

  const undo = () => {
    if (history.past.length === 0) return;

    const previousOperations = [...history.past];
    const poppedOp = previousOperations.pop()!;

    let baseState = { ...initialData, blocks: JSON.parse(JSON.stringify(initialData.blocks)) };
    previousOperations.forEach((op) => {
      baseState = dispatchOperation(baseState, op);
    });

    setPageData(baseState);
    setHistory({
      past: previousOperations,
      future: [poppedOp, ...history.future],
    });
  };

  const redo = () => {
    if (history.future.length === 0) return;

    const nextOperations = [...history.future];
    const opToApply = nextOperations.shift()!;

    const nextState = dispatchOperation(pageData, opToApply);

    setPageData(nextState);
    setHistory({
      past: [...history.past, opToApply],
      future: nextOperations,
    });
  };

  return (
    <DocumentContext.Provider value={{ pageData, history, executeOperation, undo, redo }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used inside DocumentProvider");
  }
  return context;
};
