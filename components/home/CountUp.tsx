"use client";

import { useEffect, useRef } from "react";

// Server HTML always holds the final value. With motion allowed, the number
// is reset after hydration and counts up once when it scrolls into view.
export function CountUp({ value, prefix = "", duration = 1100 }: {
  value: number;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const final = `${prefix}${value}`;

  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    element.textContent = `${prefix}0`;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${prefix}${Math.round(value * eased)}`;
        if (progress < 1) frame = window.requestAnimationFrame(step);
      };
      frame = window.requestAnimationFrame(step);
    }, { threshold: 0.4 });
    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      element.textContent = final;
    };
  }, [duration, final, prefix, value]);

  return <strong ref={ref}>{final}</strong>;
}
