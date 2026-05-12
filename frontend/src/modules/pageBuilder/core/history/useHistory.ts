import { useState, useCallback } from "react";

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
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

        const updated = prevHistory.slice(0, index + 1);

        updated.push(next);

        return updated;
      });

      setIndex((prev) => prev + 1);
    },
    [index]
  );

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) =>
      Math.min(prev + 1, history.length - 1)
    );
  }, [history.length]);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}