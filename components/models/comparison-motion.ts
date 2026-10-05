import type { ModelReveal } from "./model-types";

export const HERO_TIMING = { scrollVh: 220, versionA: 0.22, transition: 0.4, comparison: 0.65, closing: 0.8 } as const;
export const SECONDARY_SECONDS = 3.2;
export const FINAL_COMPARISON = { progress: 1, ghost: 1, highlight: 1, added: 1, emphasis: 0 } as const;
export const INITIAL_COMPARISON = { progress: 0, ghost: 0, highlight: 0, added: 0, emphasis: 0 } as const;
export function createModelReveal(): ModelReveal {
  return { ...INITIAL_COMPARISON, invalidate: null, updatedAt: 0 };
}
export function heroStage(progress: number) {
  if (progress < HERO_TIMING.versionA) return "normal";
  if (progress < HERO_TIMING.transition) return "version-a";
  if (progress < HERO_TIMING.comparison) return "transition";
  return "comparison";
}
