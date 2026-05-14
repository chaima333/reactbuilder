import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>(() => [structuredClone(initialState)]);
  const [index, setIndex] = useState(0);

  const state = history[index];

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setHistory((prevHistory) => {
        const current = prevHistory[index];

        const next =
          typeof value === "function"
            ? (value as (prev: T) => T)(current)
            : value;

        const nextClone = structuredClone(next);

        const updated = prevHistory.slice(0, index + 1);
        updated.push(nextClone);

        if (updated.length > 50) {
            updated.shift();
        }

        return updated;
      });

      setIndex((prev) => {
          const newIndex = prev + 1;
          return newIndex;
      });
    },
    [index] 
  );

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const reset = useCallback((initial: T) => {
    setHistory([structuredClone(initial)]);
    setIndex(0);
  }, []);

  return {
    state,
    set,
    undo,
    redo,
    reset,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}