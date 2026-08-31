"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode
} from "react";

type ObserverRecord = {
  observer: IntersectionObserver;
  callbacks: Map<Element, () => void>;
};

const observers = new Map<string, ObserverRecord>();

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getObserver(
  rootMargin: string,
  threshold: number,
  onVisible: (element: Element) => void
) {
  const key = `${rootMargin}:${threshold}`;
  const existing = observers.get(key);

  if (existing) {
    return existing;
  }

  const callbacks = new Map<Element, () => void>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const callback = callbacks.get(entry.target);
        callback?.();
        callbacks.delete(entry.target);
        observer.unobserve(entry.target);
        onVisible(entry.target);
      });
    },
    { rootMargin, threshold }
  );

  const record = { observer, callbacks };
  observers.set(key, record);
  return record;
}

export function useInViewOnce<T extends HTMLElement = HTMLElement>(
  rootMargin = "0px 0px -12% 0px",
  threshold = 0.12
) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!prefersReducedMotion()) {
      document.documentElement.classList.add("motion-ready");
    }

    const element = ref.current;

    if (!element || visible) {
      return;
    }

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const record = getObserver(rootMargin, threshold, () => undefined);
    record.callbacks.set(element, () => setVisible(true));
    record.observer.observe(element);

    return () => {
      record.callbacks.delete(element);
      record.observer.unobserve(element);
    };
  }, [rootMargin, threshold, visible]);

  return [ref, visible] as const;
}

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};

export function Reveal({
  as = "div",
  children,
  className = "",
  delay = 0,
  id
}: RevealProps) {
  const [ref, visible] = useInViewOnce();
  const classes = ["reveal", visible ? "is-visible" : "", className]
    .filter(Boolean)
    .join(" ");
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return createElement(as, { ref, className: classes, id, style }, children);
}
