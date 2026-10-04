"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MotionRef } from "./hero-motion";

export function useHeroAnimation(root: RefObject<HTMLDivElement | null>, motion: MotionRef, fallback = false) {
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const element = root.current;
    const controls = motion.current;
    const media = gsap.matchMedia();

    media.add({
      all: "all",
      desktop: "(min-width: 1000px) and (min-height: 680px)",
      reduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      const { desktop } = context.conditions!;
      const reduced = context.conditions!.reduced || fallback;
      const invalidate = () => controls.invalidate?.();
      gsap.set(controls, { progress: reduced ? 1 : 0 });
      gsap.set(element, {
        "--version-progress": reduced ? 1 : 0,
        "--reveal": reduced ? 1 : 0,
        "--message": 0,
        "--progress": reduced ? 1 : 0,
        "--scene-opacity": reduced ? 1 : 0
      });

      if (reduced) {
        invalidate();
        return;
      }

      gsap.to(element, { "--scene-opacity": 1, duration: 1, ease: "power2.out" });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: desktop ? element : element.querySelector("[data-bim-visual]"),
          start: desktop ? "top 60px" : "top 65%",
          end: desktop ? () => `+=${Math.round(window.innerHeight * 1.4)}` : "bottom 30%",
          pin: desktop ? element : false,
          scrub: desktop ? 0.65 : 0.3,
          invalidateOnRefresh: true
        },
        onUpdate: invalidate
      });

      timeline.to(controls, { progress: 1, duration: 1 }, 0)
        .to(element, { "--progress": 1, duration: 1 }, 0)
        .to(element, { "--version-progress": 1, duration: 0.18 }, 0.22)
        .to(element, { "--reveal": 1, duration: 0.18 }, 0.43)
        .to(element, { "--message": desktop ? 1 : 0, duration: 0.16 }, 0.74);

      // Anchored CTAs can leave the pinned section immediately with native scroll.
      const refresh = () => ScrollTrigger.refresh();
      document.fonts.ready.then(() => { if (!context.isReverted) refresh(); });
    }, element);

    return () => media.revert();
  }, [root, motion, fallback]);
}
