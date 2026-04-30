import { useState } from "react";

export const useHistory = <T,>(initial: T) => {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const set = (newState: T) => {
  setPast((prev) => {
    const updatedPast = [...prev, present];
    return updatedPast.slice(-30); // 💡 خلي كان آخر 30 حركة بركة
  });
  setPresent(newState);
  setFuture([]);
};

  const undo = () => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];

    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [present, ...prev]);
    setPresent(previous);
  };

  const redo = () => {
    if (future.length === 0) return;

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