"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { StoryFallback } from "./StoryFallback";
import { SceneBoundary } from "@/components/models/SceneBoundary";
import { STORY_ELEMENTS, STORY_EVENTS, STORY_RELEASES, STORY_SELECTED_ELEMENT, getStoryElements, getStorySummary } from "./story-data";
import styles from "./design-story.module.css";

const StoryScene = dynamic(() => import("./StoryScene").then((module) => module.StoryScene), { ssr: false });

const chapters = [
  { label: "Build the history", kicker: "A design, across time", title: "One building.\nA developing story.", body: "Each IFC release adds another moment to the design history. Explore six releases of this illustrative project.", takeaway: "Start with the sequence, then look for the pattern." },
  { label: "Follow the changes", kicker: "From revision to revision", title: "See what moved.\nAnd what changed within.", body: "Geometry, movement and information changes all matter. Purple highlights show the tracked elements changed in the selected release.", takeaway: "A property update can matter even when the shape stays the same." },
  { label: "Find the pattern", kicker: "Change, in perspective", title: "Where does change\nkeep returning?", body: "The east-wing interface changes across several releases. Amber highlights the elements with more than one change in this sample history.", takeaway: "Repeated change is a reason to investigate, not an engineering risk verdict." },
  { label: "Investigate an element", kicker: "The history behind a highlight", title: "Follow one element.\nKeep the context.", body: "Trace the supply route through its revisions. See its movement, section and information updates alongside the surrounding design.", takeaway: "The model locates the question. The history explains why it deserves attention." },
  { label: "Focus the review", kicker: "From model history to a discussion", title: "A clearer question.\nA better starting point.", body: "Bring the recurring route changes, related elements and source revisions into the next coordination review.", takeaway: "Evidence supports the team's decision. It does not make the decision for them." },
] as const;

const changeLabels = { geometry: "Geometry", movement: "Movement", information: "Information" };

export function DesignStory() {
  const [chapter, setChapter] = useState(0);
  const [revision, setRevision] = useState(STORY_RELEASES.length - 1);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = chapter === 3 ? STORY_SELECTED_ELEMENT : null;
  const current = chapters[chapter];
  const summary = getStorySummary(revision);
  const release = STORY_RELEASES[revision];
  const element = getStoryElements(revision).find((item) => item.id === STORY_SELECTED_ELEMENT)!;
  const history = STORY_EVENTS.filter((event) => event.elementId === STORY_SELECTED_ELEMENT && event.revision <= revision);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    let visible = false;
    const updateActive = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) setLoadScene(true);
      updateActive();
    }, { rootMargin: "160px 0px", threshold: 0 });
    if (host.current) observer.observe(host.current);
    document.addEventListener("visibilitychange", updateActive);
    return () => { observer.disconnect(); motion.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateActive); };
  }, []);

  function chooseChapter(index: number) {
    setChapter(index);
    setRevision(STORY_RELEASES.length - 1);
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % chapters.length;
    else if (event.key === "ArrowLeft") next = (index + chapters.length - 1) % chapters.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = chapters.length - 1;
    else return;
    event.preventDefault();
    chooseChapter(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div ref={host} className={styles.experience} data-design-story data-chapter={chapter} data-revision={revision} data-renderer={ready && !failed ? "webgl" : "svg"}>
      <div className={styles.chapterTabs} role="tablist" aria-label="Explore BIMSpect's design story">
        {chapters.map((item, index) => (
          <button key={item.label} type="button" role="tab" id={`story-tab-${index}`} aria-controls="story-chapter" aria-selected={chapter === index} tabIndex={chapter === index ? 0 : -1} onClick={() => chooseChapter(index)} onKeyDown={(event) => moveTab(event, index)} ref={(node) => { tabRefs.current[index] = node; }}>
            <span className={styles.tabNumber}>0{index + 1}</span><span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.stage} id="story-chapter" role="tabpanel" aria-labelledby={`story-tab-${chapter}`}>
        <div className={styles.modelArea}>
          <div className={styles.modelTopline}>
            <div><span className={styles.projectMark} aria-hidden="true">N</span><div><strong>Northline</strong><span>Illustrative design history</span></div></div>
            <div className={styles.releaseBadge}><i aria-hidden="true" />{release.id}<span>{release.date}</span></div>
          </div>
          <div className={styles.scene} role="img" aria-label={`Illustrative six-storey building with an open east wing. ${release.id}: ${summary.changedNow} of 12 tracked elements changed in this release; ${summary.repeated} have changed more than once in the history so far. Full evidence is available in the text panel and release controls.`}>
            <div className={`${styles.fallback} ${ready && !failed ? styles.fallbackHidden : ""}`}>
              <StoryFallback revision={revision} chapter={chapter} selectedElementId={selected} />
            </div>
            {loadScene && !failed ? <div className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`} aria-hidden="true">
              <SceneBoundary onFailure={onFailure}><StoryScene chapter={chapter} revision={revision} selectedElementId={selected} active={active} reduced={reduced} onReady={onReady} onFailure={onFailure} /></SceneBoundary>
            </div> : null}
          </div>
          <div className={styles.modelLegend} aria-label="Model legend">
            <span><i className={styles.legendContext} />Building context</span>
            <span><i className={chapter >= 2 && chapter !== 3 ? styles.legendRepeat : styles.legendChange} />{chapter === 3 ? "Selected element" : chapter >= 2 ? "Repeated change" : "Changed in this release"}</span>
            <span className={styles.disciplines}>ARC / STR / MEP</span>
          </div>
          <div className={styles.timeline} role="group" aria-label="Choose an illustrative model release">
            <div className={styles.timelineHeading}><span>Explore the releases</span><span>12 tracked example elements</span></div>
            <div className={styles.releaseButtons}>
              {STORY_RELEASES.map((item, index) => {
                const count = STORY_EVENTS.filter((event) => event.revision === index).length;
                return <button type="button" key={item.id} aria-pressed={revision === index} aria-label={`${item.id}, ${item.label}, ${index === 0 ? "initial baseline" : `${count} tracked elements changed`}`} onClick={() => setRevision(index)}>
                  <span className={styles.releaseBar} aria-hidden="true"><i style={{ height: `${Math.max(3, count * 5)}px` }} /></span>
                  <span>{item.id}</span><small>{item.date}</small>
                </button>;
              })}
            </div>
          </div>
        </div>

        <aside className={styles.insight} aria-label="Design story evidence">
          <p className={styles.insightKicker}><span>0{chapter + 1}</span>{current.kicker}</p>
          <h2>{current.title}</h2>
          <p className={styles.insightBody}>{chapter === 2 && revision === 0 ? "R01 is the baseline. Move along the timeline to see whether change returns to the same elements." : current.body}</p>
          <div className={styles.evidence}>
            {chapter === 0 ? <>
              <div className={styles.historyStack} aria-hidden="true">{STORY_RELEASES.slice(0, revision + 1).slice(-3).map(({ id }) => <div key={id}><span className={styles.fileIcon}>IFC</span><strong>Northline_{id}.ifc</strong><span>↗</span></div>)}</div>
              <dl className={styles.factRow}><div><dt>Releases shown</dt><dd>{revision + 1}<span> / 6</span></dd></div><div><dt>Disciplines in sample</dt><dd>3</dd></div></dl>
            </> : null}
            {chapter === 1 ? <>
              <p className={styles.evidenceLabel}>{release.id} · {revision === 0 ? "Initial baseline" : "Changed in this release"}</p>
              <strong className={styles.largeMetric}>{summary.changedNow}<span> / 12 tracked elements</span></strong>
              <ul className={styles.changeKinds}>{Object.entries(changeLabels).map(([kind,label]) => <li key={kind}><span>{label}</span><strong>{STORY_EVENTS.filter((event) => event.revision === revision && event.kind === kind).length}</strong></li>)}</ul>
            </> : null}
            {chapter === 2 ? <>
              <p className={styles.evidenceLabel}>Change events through {release.id}</p>
              <div className={styles.disciplineBars}>{summary.disciplines.map((item) => <div key={item.discipline}><span>{item.discipline}</span><div><i style={{ width: `${item.events / Math.max(1,...summary.disciplines.map((d) => d.events)) * 100}%` }} /></div><strong>{item.events}</strong></div>)}</div>
              <dl className={styles.factRow}><div><dt>Changed repeatedly</dt><dd>{summary.repeated}<span> / 12</span></dd></div><div><dt>No tracked changes</dt><dd>{summary.unchanged}<span> / 12</span></dd></div></dl>
            </> : null}
            {chapter === 3 ? <>
              <div className={styles.elementLabel}><span className={styles.elementDot} /><div><strong>{element.label}</strong><span>{element.id} · {element.zone}</span></div></div>
              <ol className={styles.elementHistory}>
                <li><span>R01</span><div><strong>Initial route</strong><p>First appearance in the example.</p></div></li>
                {history.map((event) => <li key={event.revision}><span>{STORY_RELEASES[event.revision].id}</span><div><strong>{changeLabels[event.kind]}</strong><p>{event.detail}</p></div></li>)}
              </ol>
            </> : null}
            {chapter === 4 ? <div className={styles.reviewNote}>
              <p className={styles.evidenceLabel}>Illustrative review brief</p>
              <h3>East-wing service interface</h3>
              <p>{element.revisionCount > 0 ? `The supply route has ${element.revisionCount} recorded ${element.revisionCount === 1 ? "change" : "changes"} through ${release.id}. Review its history with the adjacent partition and beam.` : "This release establishes the initial route. Later releases add the history for review."}</p>
              <div className={styles.reviewSource}><span>Source history</span><strong>R01 → {release.id}</strong></div>
              <div className={styles.reviewSource}><span>Review scope</span><strong>ARC · STR · MEP</strong></div>
              <span className={styles.reviewQuestion}>Question for the team</span>
              <p>Is the current route coordinated with the latest room and structural layout?</p>
            </div> : null}
          </div>
          <p className={styles.takeaway}>{current.takeaway}</p>
          {chapter < chapters.length - 1 ? <button type="button" className={styles.next} onClick={() => { chooseChapter(chapter + 1); tabRefs.current[chapter + 1]?.focus(); }}>Next: {chapters[chapter + 1].label.toLowerCase()}<span aria-hidden="true">→</span></button> : <a className={styles.next} href="#demo">See the real product<span aria-hidden="true">↗</span></a>}
        </aside>
      </div>
      <div className={styles.footnote}><p>Illustrative model and sample history. Explore the releases and chapters.</p><span>{failed ? "Static model · All story controls available" : "Built around one continuous design history"}</span></div>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{release.id}. {summary.changedNow} tracked elements changed in this release. {summary.repeated} of {STORY_ELEMENTS.length} elements have repeated changes through this release.</p>
    </div>
  );
}
