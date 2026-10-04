"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { DisciplineModelContent, ModelControlsContent } from "@/content/home";
import type { Discipline, ModelReveal } from "./model-types";
import { useModelScrollReveal } from "./useModelScrollReveal";
import { ModelFallback } from "./ModelFallback";
import { SceneBoundary } from "./SceneBoundary";
import styles from "./models.module.css";

const ModelCanvas = dynamic(() => import("./ModelCanvas"), { ssr: false, loading: () => null });
export function DisciplineModel({ discipline, content, controls }: {
  discipline: Discipline; content: DisciplineModelContent; controls: ModelControlsContent;
}) {
  const root = useRef<HTMLElement>(null);
  const motion = useRef<ModelReveal>({ progress: 0, invalidate: null, updatedAt: 0 });
  const id = useId();
  const [loaded, setLoaded] = useState(false), [active, setActive] = useState(false);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useModelScrollReveal(root, motion);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let visible = false;
    const visibility = () => setActive(visible && !document.hidden);
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoaded(true); nearby.disconnect(); }
    }, { rootMargin: "250px" });
    const onscreen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); });
    nearby.observe(element); onscreen.observe(element);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      nearby.disconnect(); onscreen.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return <figure ref={root} aria-labelledby={`${id}-title`} className={styles.frame} data-discipline-model={discipline}
    data-model-ready={ready} data-model-active={active}>
    <div className={styles.heading}>
      <span id={`${id}-title`}>{content.environment}</span>
      <span className={styles.version}><span>{controls.modelState}</span><span>{controls.changesState}</span></span>
    </div>
    <div data-model-viewport className={styles.viewport} role="img" aria-label={content.sceneDescription}>
      <div className={styles.fallback} data-visible={!ready}><ModelFallback discipline={discipline} /></div>
      {loaded && !failed ? <div className={styles.canvas} aria-hidden="true">
        <SceneBoundary onFailure={onFailure}><ModelCanvas discipline={discipline} motion={motion} active={active}
          onReady={onReady} onFailure={onFailure} /></SceneBoundary>
      </div> : null}
    </div>
    <div className={styles.annotations} aria-hidden="true">{content.changes.slice(0, 2).map(change =>
      <span key={change.detail} data-change-kind={change.kind}>{change.detail}</span>)}</div>
    <figcaption className={styles.caption}>{controls.caption}</figcaption>
    <ul className="sr-only">{content.changes.map(change => <li key={change.detail}>{change.detail}</li>)}</ul>
    {failed ? <p className={styles.status}>{controls.modelUnavailable}</p> : null}
  </figure>;
}
