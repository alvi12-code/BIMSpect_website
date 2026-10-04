"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { HeroExperienceContent } from "@/content/home";
import type { HeroMotion } from "./hero-motion";
import { useHeroAnimation } from "./useHeroAnimation";
import { SceneBoundary } from "@/components/models/SceneBoundary";
import styles from "./hero.module.css";

const BimScene = dynamic(() => import("./BimScene"), { ssr: false, loading: () => null });

export function BimspectHero({ children, fallback, content }: {
  children: ReactNode; fallback: ReactNode; content: HeroExperienceContent;
}) {
  const root = useRef<HTMLDivElement>(null);
  const motion = useRef<HeroMotion>({ progress: 0, invalidate: null, updatedAt: 0 });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  useHeroAnimation(root, motion, failed);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(preference.matches);
    updateMotion();
    preference.addEventListener("change", updateMotion);
    let visible = true;
    const updateActive = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateActive(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", updateActive);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateActive);
    };
  }, []);

  return (
    <div ref={root} className={styles.stage} data-scene-ready={ready}>
      <div className={styles.grid}>
        {children}
        <div className={styles.visual} data-bim-visual>
          <div className={styles.modelHeading} aria-hidden="true">
            <span className={styles.modelIdentity}>IFC / ARCH</span>
            <div className={styles.version}>
              <span className={styles.versionBefore}>{content.version} A</span>
              <span className={styles.versionAfter}>{content.version} B</span>
            </div>
          </div>
          <div className={styles.viewport} role="img" aria-label={content.sceneDescription}>
            <div className={styles.fallback} data-visible={!ready}>{fallback}</div>
            {!failed ? (
              <div className={styles.canvas} aria-hidden="true">
                <SceneBoundary onFailure={onFailure}>
                  <BimScene motion={motion} content={content} active={active} reduced={reduced} onReady={onReady} onFailure={onFailure} />
                </SceneBoundary>
              </div>
            ) : null}
          </div>
          <div className={styles.stats} aria-label={content.illustration}>
            <div className={styles.added}><span className={styles.dot} /><strong>2</strong><span>{content.added}</span></div>
            <div className={styles.removed}><span className={styles.dot} /><strong>1</strong><span>{content.removed}</span></div>
            <div className={styles.changed}><span className={styles.dot} /><strong>3</strong><span>{content.changed}</span></div>
          </div>
          <p className={styles.annotations}>{content.wall} · {content.moved}<span>{content.window} · {content.windowDetail}</span></p>
          <p className={styles.mobileMessage}>{content.finalTitle} <span>{content.finalEmphasis}</span></p>
          <p className={styles.caption}>{content.illustration}</p>
        </div>
      </div>
      <div className={styles.footer} aria-hidden="true">
        <span className={styles.scrollCue}>{content.scroll}<span>↓</span></span>
        <div className={styles.steps}>
          <span><b>01</b>{content.model}</span><span><b>02</b>{content.compare}</span><span><b>03</b>{content.result}</span>
          <i className={styles.track}><i /></i>
        </div>
        <span className={styles.footerNote}>BIMSpect / IFC</span>
      </div>
    </div>
  );
}
