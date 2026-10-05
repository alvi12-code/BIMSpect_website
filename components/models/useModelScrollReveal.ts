"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { FINAL_COMPARISON, INITIAL_COMPARISON, SECONDARY_SECONDS } from "./comparison-motion";
import { playWhenVisible } from "./animation-lifecycle";
import type { ModelReveal } from "./model-types";

/** Readiness-gated, once-only 3.2s stories on ALL devices. No pin or scrub. */
export function useModelScrollReveal(root: RefObject<HTMLElement | null>, motion: RefObject<ModelReveal>, ready: boolean, fallback = false) {
  const completed = useRef(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const controls = motion.current;
    if (!ready && !fallback) {
      gsap.set(controls, matchMedia("(prefers-reduced-motion: reduce)").matches ? FINAL_COMPARISON : INITIAL_COMPARISON);
      return;
    }
    const media = gsap.matchMedia();
    media.add({ all: "all", reduced: "(prefers-reduced-motion: reduce)" }, context => {
      const ui = { modelProgress: 0, annotation: 0, storyProgress: 0 };
      let lastRevision = "";
      const update = () => {
        for (const [key, value] of Object.entries(ui)) element.style.setProperty(`--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, String(value));
        element.dataset.modelProgress = controls.progress.toFixed(3);
        const revision = [controls.progress, controls.ghost, controls.highlight, controls.added, controls.emphasis].join(":");
        if (revision !== lastRevision) { lastRevision = revision; controls.invalidate?.(); }
      };
      if (context.conditions!.reduced || fallback || completed.current) {
        gsap.set(controls, FINAL_COMPARISON);
        Object.assign(ui, { modelProgress: 1, annotation: 1 });
        element.dataset.modelState = "comparison";
        update(); return;
      }
      gsap.set(controls, INITIAL_COMPARISON);
      element.dataset.modelState = "version-a";
      update();
      const timeline = gsap.timeline({ paused: true, onUpdate: update,
        onComplete: () => { completed.current = true; element.dataset.modelState = "comparison"; }
      });
      timeline.to(ui, { storyProgress: 1, duration: SECONDARY_SECONDS, ease: "none" }, 0)
        .call(() => { element.dataset.modelState = "old-route"; }, [], 0.5)
        .to(controls, { ghost: 1, duration: 0.65, ease: "power2.inOut" }, 0.5)
        .call(() => { element.dataset.modelState = "new-route"; }, [], 1.1)
        .to(controls, { progress: 1, duration: 1.1, ease: "power2.inOut" }, 1.1)
        .to(controls, { added: 1, duration: 0.7, ease: "power2.out" }, 1.45)
        .to(controls, { highlight: 1, duration: 0.5, ease: "power2.out" }, 1.7)
        .to(controls, { emphasis: 1, duration: 0.25, ease: "power2.out" }, 2.05)
        .to(controls, { emphasis: 0, duration: 0.45, ease: "power2.out" }, 2.3)
        .to(ui, { modelProgress: 1, duration: 0.4, ease: "power2.out" }, 1.9)
        .to(ui, { annotation: 1, duration: 0.55, ease: "power2.out" }, 2.2);
      const viewport = element.querySelector("[data-model-viewport]");
      const cleanup = viewport ? playWhenVisible(viewport, timeline) : () => timeline.kill();
      return () => {
        cleanup();
        for (const key of Object.keys(ui)) element.style.removeProperty(`--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`);
      };
    }, element);
    return () => media.revert();
  }, [root, motion, ready, fallback]);
}
