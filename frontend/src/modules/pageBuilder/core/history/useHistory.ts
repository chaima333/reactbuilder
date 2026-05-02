import { useState } from "react";

export const useHistory = <T,>(initial: T) => {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const set = (newState: T | ((prev: T) => T)) => {
    setPast((prev) => [...prev, present].slice(-30));

    setPresent((prev) =>
      typeof newState === "function"
        ? (newState as (p: T) => T)(prev)
        : newState
    );

    setFuture([]);
  };

  const undo = () => {
    if (!past.length) return;

    const previous = past[past.length - 1];

    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
  };

  const redo = () => {
    if (!future.length) return;

    const next = future[0];

    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, present]);
    setPresent(next);
  };

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
};