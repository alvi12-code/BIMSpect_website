"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ModelReveal } from "./model-types";

/** Two secondary examples share a compact native-scroll reveal. Never pins.
 * Phones play once on entry; reduced motion starts at the final comparison.
 */
export function useModelScrollReveal(root: RefObject<HTMLElement | null>, motion: RefObject<ModelReveal>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ all: "all", mobile: "(max-width: 800px)", reduced: "(prefers-reduced-motion: reduce)" }, context => {
      const { mobile, reduced } = context.conditions!;
      const controls = motion.current;
      const update = () => {
        element.style.setProperty("--model-progress", String(controls.progress));
        element.style.setProperty("--annotation", String(Math.max(0, Math.min(1, (controls.progress - 0.72) / 0.2))));
        element.dataset.modelProgress = controls.progress.toFixed(3);
        controls.invalidate?.();
      };
      gsap.set(controls, { progress: reduced ? 1 : 0 });
      update();
      if (reduced) return;
      gsap.to(controls, {
        progress: 1, duration: 1.15, ease: mobile ? "power2.out" : "none", onUpdate: update,
        scrollTrigger: {
          trigger: element.querySelector("[data-model-viewport]"),
          start: "top 78%", end: "top 32%", scrub: mobile ? false : 0.35,
          once: Boolean(mobile), invalidateOnRefresh: true
        }
      });
      document.fonts.ready.then(() => { if (!context.isReverted) ScrollTrigger.refresh(); });
    }, element);
    return () => media.revert();
  }, [root, motion]);
}
