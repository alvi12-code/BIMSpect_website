"use client";

import { useEffect, useState } from "react";

/** Coarse-pointer/hybrid devices get the phone GPU budget even at desktop width. */
export function useRenderBudget() {
  const [compact, setCompact] = useState(true);
  useEffect(() => {
    const media = matchMedia("(max-width: 800px), (pointer: coarse), (hover: none)");
    const update = () => setCompact(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return compact;
}
