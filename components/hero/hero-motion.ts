import type { RefObject } from "react";
import type { ModelReveal } from "../models/model-types";

export type HeroMotion = ModelReveal;

export type MotionRef = RefObject<HeroMotion>;

// The staged timeline holds progress at 0, animates this revision, then holds 1.
export function changeProgress(progress: number) {
  return smoothRange(progress, 0, 1);
}

export function smoothRange(progress: number, start: number, end: number) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)));
  return value * value * (3 - 2 * value);
}
