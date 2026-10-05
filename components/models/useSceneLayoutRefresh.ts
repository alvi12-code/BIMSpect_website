"use client";

import { useEffect, type RefObject } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeScrollTrigger } from "./animation-lifecycle";

/** Coalesce readiness/fonts/real viewport resizes. Never refresh per frame.
 * Observe the reserved model viewport, not the pin spacer (avoids RO feedback).
 */
export function useSceneLayoutRefresh(root: RefObject<HTMLElement | null>, ready: boolean) {
  useEffect(() => {
    const element = root.current;
    if (!element || !ready) return;
    initializeScrollTrigger();
    let cancelled = false, timer = 0, frame = 0;
    const refresh = () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      timer = window.setTimeout(() => {
        frame = requestAnimationFrame(() => { if (!cancelled) ScrollTrigger.refresh(true); });
      }, 120);
    };
    refresh();
    document.fonts?.ready.then(() => { if (!cancelled) refresh(); });
    const viewport = element.querySelector("[data-bim-viewport], [data-model-viewport]");
    let width = 0, height = 0;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(([entry]) => {
      const box = entry.contentRect;
      if (Math.abs(box.width - width) > 1 || Math.abs(box.height - height) > 16) {
        width = box.width; height = box.height; refresh();
      }
    }) : null;
    if (viewport) observer?.observe(viewport);
    window.addEventListener("orientationchange", refresh);
    window.addEventListener("pageshow", refresh);
    if (!observer) window.addEventListener("resize", refresh);
    return () => {
      cancelled = true; observer?.disconnect();
      window.clearTimeout(timer); cancelAnimationFrame(frame);
      window.removeEventListener("orientationchange", refresh);
      window.removeEventListener("pageshow", refresh);
      window.removeEventListener("resize", refresh);
    };
  }, [root, ready]);
}
