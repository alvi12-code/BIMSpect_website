"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function initializeScrollTrigger() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** Start only when the actual model is ~45% visible and ready. Pause offscreen
 * or in a hidden tab; returning resumes, never restarts a completed story.
 */
export function playWhenVisible(viewport: Element, timeline: gsap.core.Timeline) {
  let started = false, visible = false, qualified = false;
  const visibility = () => {
    if (!started && qualified && !document.hidden) {
      started = true;
      timeline.play(0);
    }
    if (!started) return;
    if (visible && !document.hidden) timeline.resume();
    else timeline.pause();
  };
  if (!("IntersectionObserver" in window)) {
    timeline.play(0);
    return () => timeline.kill();
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    qualified = entry.intersectionRatio >= 0.45;
    visibility();
  }, { threshold: [0, 0.45] });
  observer.observe(viewport);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    observer.disconnect();
    document.removeEventListener("visibilitychange", visibility);
    timeline.kill();
  };
}
