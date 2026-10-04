"use client";

import { useEffect, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { SceneMotion } from "./model-types";

/** Keep demand rendering smooth during an external GSAP update, then sleep.
 * A bounded 80ms tail avoids alternate-frame wakeups without an idle render loop.
 */
export function useSceneInvalidation(motion: RefObject<SceneMotion>, active: boolean, reduced = false) {
  const { invalidate } = useThree();
  useEffect(() => {
    const controls = motion.current;
    Object.assign(controls, { invalidate: () => {
      if (!active) return;
      Object.assign(controls, { updatedAt: performance.now() });
      invalidate();
    } });
    invalidate();
    return () => { Object.assign(controls, { invalidate: null }); };
  }, [motion, active, reduced, invalidate]);
  useFrame(() => {
    if (active && !reduced && performance.now() - motion.current.updatedAt < 80) invalidate();
  });
}
