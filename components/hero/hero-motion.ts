import type { RefObject } from "react";
import type { ModelReveal } from "../models/model-types";

export type HeroMotion = ModelReveal;

export type MotionRef = RefObject<HeroMotion>;

// Shared thresholds keep model highlights and HTML annotations in sync.
export function changeProgress(progress: number) {
  return smoothRange(progress, 0.32, 0.49);
}

export function smoothRange(progress: number, start: number, end: number) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return value * value * (3 - 2 * value);
}

