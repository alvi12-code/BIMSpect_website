"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FINAL_COMPARISON, HERO_TIMING, INITIAL_COMPARISON, heroStage } from "../models/comparison-motion";
import { initializeScrollTrigger, playWhenVisible } from "../models/animation-lifecycle";
import type { MotionRef } from "./hero-motion";

export function useHeroAnimation(root: RefObject<HTMLDivElement | null>, motion: MotionRef, ready: boolean, fallback = false) {
  const completed = useRef(false), emphasized = useRef(false);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const controls = motion.current;
    if (!ready && !fallback) {
      gsap.set(controls, matchMedia("(prefers-reduced-motion: reduce)").matches ? FINAL_COMPARISON : INITIAL_COMPARISON);
      return;
    }
    initializeScrollTrigger();
    const media = gsap.matchMedia();
    media.add({
      all: "all",
      desktop: "(min-width: 1000px) and (min-height: 680px) and (pointer: fine) and (hover: hover)",
      reduced: "(prefers-reduced-motion: reduce)"
    }, context => {
      const desktop = Boolean(context.conditions!.desktop), reduced = context.conditions!.reduced || fallback;
      const ui = { versionProgress: 0, versionVisible: desktop ? 0 : 1, reveal: 0, message: 0, progress: 0, sceneOpacity: 1 };
      // Plain-object channels survive pin refresh/revert. Do not let a pin's
      // cached CSS snapshot become the timeline's new starting comparison.
      let lastRevision = "";
      const update = () => {
        for (const [key, value] of Object.entries(ui)) element.style.setProperty(`--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, String(value));
        element.dataset.modelProgress = controls.progress.toFixed(3);
        const revision = [controls.progress, controls.ghost, controls.highlight, controls.added, controls.emphasis].join(":");
        if (revision !== lastRevision) { lastRevision = revision; controls.invalidate?.(); }
      };
      const final = () => {
        gsap.set(controls, FINAL_COMPARISON);
        Object.assign(ui, { versionProgress: 1, versionVisible: 1, reveal: 1, message: 0, progress: 1 });
        element.dataset.heroStage = "comparison";
        update();
      };
      element.dataset.motionMode = reduced ? "static" : desktop ? "scroll" : "automatic";
      if (reduced || (!desktop && completed.current)) {
        final();
        element.dataset.scrollTriggerCount = String(ScrollTrigger.getAll().length);
        return;
      }
      gsap.set(controls, INITIAL_COMPARISON);
      element.dataset.heroStage = desktop ? "normal" : "version-a";
      update();
      // One brief emphasis, not a scroll-linked pulse or an idle effect.
      const emphasis = gsap.timeline({ paused: true, onUpdate: update })
        .to(controls, { emphasis: 1, duration: 0.25, ease: "power2.out" })
        .to(controls, { emphasis: 0, duration: 0.45, ease: "power2.out" });
      const emphasize = () => { if (!emphasized.current) { emphasized.current = true; emphasis.play(0); } };
      let cleanup: (() => void) | undefined;
      if (desktop) {
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            id: "bimspect-hero", trigger: element, start: "top 60px",
            end: () => `+=${Math.round(document.documentElement.clientHeight * HERO_TIMING.scrollVh / 100)}`,
            pin: true, scrub: 0.5, invalidateOnRefresh: true
          },
          onUpdate: () => {
            const p = timeline.progress();
            element.dataset.heroStage = heroStage(p);
            element.dataset.storyProgress = p.toFixed(3);
            if (p >= HERO_TIMING.comparison) emphasize();
            update();
          }
        });
        timeline.addLabel("normal", 0).addLabel("version-a", HERO_TIMING.versionA)
          .addLabel("transition", HERO_TIMING.transition).addLabel("comparison", HERO_TIMING.comparison)
          .to(ui, { progress: 1, duration: 1 }, 0)
          .to(ui, { versionVisible: 1, duration: 0.04 }, HERO_TIMING.versionA)
          .to(controls, { progress: 1, ghost: 1, duration: 0.25, ease: "power2.inOut" }, HERO_TIMING.transition)
          .to(controls, { added: 1, duration: 0.15, ease: "power2.out" }, 0.5)
          .to(controls, { highlight: 1, duration: 0.1, ease: "power2.out" }, 0.52)
          .to(ui, { versionProgress: 1, duration: 0.12 }, 0.5)
          .to(ui, { reveal: 1, duration: 0.06 }, HERO_TIMING.comparison)
          .to(ui, { message: 1, duration: 0.08 }, HERO_TIMING.closing);
      } else {
        const timeline = gsap.timeline({ paused: true, onUpdate: update, onComplete: () => { completed.current = true; element.dataset.heroStage = "comparison"; } });
        timeline.to(ui, { progress: 1, duration: 3.6, ease: "none" }, 0)
          .call(() => { element.dataset.heroStage = "transition"; }, [], 0.7)
          .to(controls, { ghost: 1, duration: 0.7, ease: "power2.out" }, 0.7)
          .to(controls, { progress: 1, duration: 1.7, ease: "power2.inOut" }, 0.7)
          .to(controls, { highlight: 1, duration: 0.5, ease: "power2.out" }, 1.4)
          .to(controls, { added: 1, duration: 0.65, ease: "power2.out" }, 1.65)
          .to(ui, { versionProgress: 1, duration: 0.4 }, 2)
          .call(emphasize, [], 2.4)
          .call(() => { element.dataset.heroStage = "comparison"; }, [], 2.4)
          .to(ui, { reveal: 1, duration: 0.45, ease: "power2.out" }, 2.45);
        const viewport = element.querySelector("[data-bim-viewport]");
        if (viewport) cleanup = playWhenVisible(viewport, timeline);
      }
      element.dataset.scrollTriggerCount = String(ScrollTrigger.getAll().length);
      return () => {
        cleanup?.(); emphasis.kill();
        for (const key of Object.keys(ui)) element.style.removeProperty(`--${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`);
      };
    }, element);
    return () => media.revert();
  }, [root, motion, ready, fallback]);
}
