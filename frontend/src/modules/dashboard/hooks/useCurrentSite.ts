// src/hooks/useCurrentSite.ts
import { useState } from "react";

export const useCurrentSite = () => {
  const [siteId, setSiteId] = useState<number | null>(
    Number(localStorage.getItem("siteId")) || null
  );

  const selectSite = (id: number) => {
    localStorage.setItem("siteId", id.toString());
    setSiteId(id);
  };

  return { siteId, selectSite };
};