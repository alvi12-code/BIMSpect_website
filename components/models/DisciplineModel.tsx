"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { DisciplineModelContent, ModelControlsContent } from "@/content/home";
import type { Discipline } from "./model-types";
import { createModelReveal } from "./comparison-motion";
import { useSceneLayoutRefresh } from "./useSceneLayoutRefresh";
import { useModelScrollReveal } from "./useModelScrollReveal";
import { ModelFallback } from "./ModelFallback";
import { SceneBoundary } from "./SceneBoundary";
import styles from "./models.module.css";

const ModelCanvas = dynamic(() => import("./ModelCanvas"), { ssr: false, loading: () => null });
export function DisciplineModel({ discipline, content, controls }: {
  discipline: Discipline; content: DisciplineModelContent; controls: ModelControlsContent;
}) {
  const root = useRef<HTMLElement>(null);
  const motion = useRef(createModelReveal());
  const id = useId();
  const [loaded, setLoaded] = useState(false), [active, setActive] = useState(false);
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useModelScrollReveal(root, motion, ready, failed);
  useSceneLayoutRefresh(root, ready || failed);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(preference.matches);
    updateMotion(); preference.addEventListener("change", updateMotion);
    const viewport = element.querySelector("[data-model-viewport]") ?? element;
    let visible = false;
    const visibility = () => setActive(visible && !document.hidden);
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoaded(true); nearby.disconnect(); }
    }, { rootMargin: "250px" });
    const onscreen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visibility(); });
    nearby.observe(viewport); onscreen.observe(viewport);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      nearby.disconnect(); onscreen.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", updateMotion);
    };
  }, []);
  useEffect(() => {
    if (!loaded || ready || failed || !active) return;
    const timer = window.setTimeout(onFailure, 12000);
    return () => window.clearTimeout(timer);
  }, [loaded, ready, failed, active, onFailure]);
  return <figure ref={root} aria-labelledby={`${id}-title`} className={styles.frame} data-discipline-model={discipline}
    data-model-ready={ready} data-model-active={active}>
    <div className={styles.heading}>
      <span id={`${id}-title`}>{content.environment}</span>
      <span className={styles.version}><span>{controls.modelState}</span><span>{controls.changesState}</span></span>
    </div>
    <div data-model-viewport className={styles.viewport} role="img" aria-label={content.sceneDescription}>
      <div className={styles.fallback} data-visible={!ready}><ModelFallback discipline={discipline} /></div>
      {loaded && !failed ? <div className={styles.canvas} aria-hidden="true">
        <SceneBoundary onFailure={onFailure}><ModelCanvas discipline={discipline} motion={motion} active={active} reduced={reduced}
          onReady={onReady} onFailure={onFailure} /></SceneBoundary>
      </div> : null}
    </div>
    <p className={styles.key} aria-hidden="true"><span data-change-kind="changed">{controls.changed}</span><span data-change-kind="added">{controls.added}</span><span data-change-kind="removed">{controls.previous}</span></p>
    <div className={styles.annotations} aria-hidden="true">{content.changes.slice(0, 2).map(change =>
      <span key={change.detail} data-change-kind={change.kind}>{change.detail}</span>)}</div>
    <figcaption className={styles.caption}>{controls.caption}</figcaption>
    <ul className="sr-only">{content.changes.map(change => <li key={change.detail}>{change.detail}</li>)}</ul>
    {failed ? <p className={styles.status}>{controls.modelUnavailable}</p> : null}
  </figure>;
}
