"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { StoryFallback } from "./StoryFallback";
import type { StoryViewCommand } from "./StoryScene";
import { SceneBoundary } from "@/components/models/SceneBoundary";
import { STORY_ELEMENTS, STORY_EVENTS, STORY_RELEASES, STORY_SELECTED_ELEMENT, getStoryElements, getStorySummary, type StoryLocale } from "./story-data";
import { storyCopy, storyElementText, storyEventDetail, storyReleaseLabel } from "./story-copy";
import styles from "./design-story.module.css";

const StoryScene = dynamic(() => import("./StoryScene").then((module) => module.StoryScene), { ssr: false });

export function DesignStory({ locale = "en" }: { locale?: StoryLocale }) {
  const copy = storyCopy[locale];
  const chapters = copy.chapters;
  const changeLabels = copy.changeLabels;
  const [chapter, setChapter] = useState(0);
  const [revision, setRevision] = useState(STORY_RELEASES.length - 1);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(STORY_SELECTED_ELEMENT);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewCommand, setViewCommand] = useState<StoryViewCommand>();
  const [orbit, setOrbit] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = chapter === 3 ? selectedId : null;
  const current = chapters[chapter];
  const summary = getStorySummary(revision);
  const release = STORY_RELEASES[revision];
  const elements = getStoryElements(revision);
  // The review brief always follows the story's supply route; the inspected
  // element is whichever one the visitor picked in the model or the list.
  const element = elements.find((item) => item.id === STORY_SELECTED_ELEMENT)!;
  const inspected = elements.find((item) => item.id === selectedId) ?? element;
  const inspectedText = storyElementText(inspected, locale);
  const history = STORY_EVENTS.filter((event) => event.elementId === inspected.id && event.revision <= revision);
  const hovered = hoveredId ? elements.find((item) => item.id === hoveredId) : undefined;
  const sceneReady = ready && !failed;
  const onHover = useCallback((id: string | null) => setHoveredId(id), []);
  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    setChapter(3);
  }, []);
  const sendView = (kind: StoryViewCommand["kind"]) => setViewCommand((last) => ({ kind, id: (last?.id ?? 0) + 1 }));
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointer = () => setOrbit(finePointer.matches);
    updatePointer();
    finePointer.addEventListener("change", updatePointer);
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
    return () => { observer.disconnect(); finePointer.removeEventListener("change", updatePointer); motion.removeEventListener("change", updateMotion); document.removeEventListener("visibilitychange", updateActive); };
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
      <div className={styles.chapterTabs} role="tablist" aria-label={copy.tablist}>
        {chapters.map((item, index) => (
          <button key={item.label} type="button" role="tab" id={`story-tab-${index}`} aria-controls="story-chapter" aria-selected={chapter === index} tabIndex={chapter === index ? 0 : -1} onClick={() => chooseChapter(index)} onKeyDown={(event) => moveTab(event, index)} ref={(node) => { tabRefs.current[index] = node; }}>
            <span className={styles.tabNumber}>0{index + 1}</span><span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.stage} id="story-chapter" role="tabpanel" aria-labelledby={`story-tab-${chapter}`}>
        <div className={styles.modelArea}>
          <div className={styles.modelTopline}>
            <div><span className={styles.projectMark} aria-hidden="true">N</span><div><strong>Northline</strong><span>{copy.projectSubtitle}</span></div></div>
            <div className={styles.releaseBadge}><i aria-hidden="true" />{release.id}<span>{release.date}</span></div>
          </div>
          <div className={styles.sceneWrap} data-hovering={hovered ? "" : undefined} data-orbit={orbit ? "" : undefined}>
            <div className={styles.scene} role="img" aria-label={copy.sceneDescription(release.id, summary.changedNow, summary.repeated)}>
              <div className={`${styles.fallback} ${ready && !failed ? styles.fallbackHidden : ""}`}>
                <StoryFallback revision={revision} chapter={chapter} selectedElementId={selected} />
              </div>
              {loadScene && !failed ? <div className={`${styles.canvas} ${ready ? styles.canvasReady : ""}`} aria-hidden="true">
                <SceneBoundary onFailure={onFailure}><StoryScene chapter={chapter} revision={revision} selectedElementId={selected} hoveredElementId={hoveredId} active={active} reduced={reduced} orbit={orbit} viewCommand={viewCommand} onHover={onHover} onSelect={onSelect} onReady={onReady} onFailure={onFailure} /></SceneBoundary>
              </div> : null}
            </div>
            {hovered ? <div className={styles.hoverCard} aria-hidden="true">
              <span>{hovered.discipline} · {hovered.id}</span>
              <strong>{storyElementText(hovered, locale).label}</strong>
              <small>{copy.recordedChanges(hovered.revisionCount)} · R01–{release.id}</small>
            </div> : null}
            {sceneReady ? <div className={styles.viewControls} role="group" aria-label={copy.viewControls}>
              <span className={styles.viewHint}>{orbit ? copy.orbitHint : copy.tapHint}</span>
              {orbit ? <>
                <button type="button" onClick={() => sendView("in")} aria-label={copy.zoomIn} title={copy.zoomIn}>+</button>
                <button type="button" onClick={() => sendView("out")} aria-label={copy.zoomOut} title={copy.zoomOut}>−</button>
              </> : null}
              <button type="button" onClick={() => sendView("reset")} aria-label={copy.resetView} title={copy.resetView}>⟲</button>
            </div> : null}
          </div>
          <div className={styles.modelLegend} aria-label={copy.legend}>
            <span><i className={styles.legendContext} />{copy.buildingContext}</span>
            <span><i className={chapter >= 2 && chapter !== 3 ? styles.legendRepeat : styles.legendChange} />{chapter === 3 ? copy.selectedElement : chapter >= 2 ? copy.repeatedChange : copy.changedInRelease}</span>
            <span className={styles.disciplines}>ARC / STR / MEP</span>
          </div>
          <div className={styles.timeline} role="group" aria-label={copy.timeline}>
            <div className={styles.timelineHeading}><span>{copy.exploreReleases}</span><span>{copy.trackedElements}</span></div>
            <div className={styles.releaseButtons}>
              {STORY_RELEASES.map((item, index) => {
                const count = STORY_EVENTS.filter((event) => event.revision === index).length;
                return <button type="button" key={item.id} aria-pressed={revision === index} aria-label={copy.releaseButton(item.id, storyReleaseLabel(index, item.label, locale), index === 0, count)} onClick={() => setRevision(index)}>
                  <span className={styles.releaseBar} aria-hidden="true"><i style={{ height: `${Math.max(3, count * 5)}px` }} /></span>
                  <span>{item.id}</span><small>{item.date}</small>
                </button>;
              })}
            </div>
          </div>
        </div>

        <aside className={styles.insight} aria-label={copy.evidence}>
          <p className={styles.insightKicker}><span>0{chapter + 1}</span>{current.kicker}</p>
          <h2>{current.title}</h2>
          <p className={styles.insightBody}>{chapter === 2 && revision === 0 ? copy.baselineBody : chapter === 3 && inspected.id !== STORY_SELECTED_ELEMENT ? copy.inspectBody(inspectedText.label) : current.body}</p>
          <div className={styles.evidence}>
            {chapter === 0 ? <>
              <div className={styles.historyStack} aria-hidden="true">{STORY_RELEASES.slice(0, revision + 1).slice(-3).map(({ id }) => <div key={id}><span className={styles.fileIcon}>IFC</span><strong>Northline_{id}.ifc</strong><span>↗</span></div>)}</div>
              <dl className={styles.factRow}><div><dt>{copy.releasesShown}</dt><dd>{revision + 1}<span> / 6</span></dd></div><div><dt>{copy.disciplinesInSample}</dt><dd>3</dd></div></dl>
            </> : null}
            {chapter === 1 ? <>
              <p className={styles.evidenceLabel}>{release.id} · {revision === 0 ? copy.initialBaseline : copy.changedInRelease}</p>
              <strong className={styles.largeMetric}>{summary.changedNow}<span>{copy.ofTracked}</span></strong>
              <ul className={styles.changeKinds}>{Object.entries(changeLabels).map(([kind,label]) => <li key={kind}><span>{label}</span><strong>{STORY_EVENTS.filter((event) => event.revision === revision && event.kind === kind).length}</strong></li>)}</ul>
            </> : null}
            {chapter === 2 ? <>
              <p className={styles.evidenceLabel}>{copy.eventsThrough(release.id)}</p>
              <div className={styles.disciplineBars}>{summary.disciplines.map((item) => <div key={item.discipline}><span>{item.discipline}</span><div><i style={{ width: `${item.events / Math.max(1,...summary.disciplines.map((d) => d.events)) * 100}%` }} /></div><strong>{item.events}</strong></div>)}</div>
              <dl className={styles.factRow}><div><dt>{copy.changedRepeatedly}</dt><dd>{summary.repeated}<span> / 12</span></dd></div><div><dt>{copy.noTrackedChanges}</dt><dd>{summary.unchanged}<span> / 12</span></dd></div></dl>
            </> : null}
            {chapter === 3 ? <>
              <label className={styles.elementPicker}>
                <span>{copy.chooseElement}</span>
                <select value={inspected.id} onChange={(event) => setSelectedId(event.target.value)}>
                  {elements.map((item) => <option key={item.id} value={item.id}>{item.id} · {storyElementText(item, locale).label}</option>)}
                </select>
              </label>
              <div className={styles.elementLabel}><span className={styles.elementDot} /><div><strong>{inspectedText.label}</strong><span>{inspected.id} · {inspectedText.zone}</span></div></div>
              <ol className={styles.elementHistory}>
                <li><span>R01</span><div><strong>{inspected.kind === "duct" ? copy.initialRoute : copy.initialState}</strong><p>{copy.firstAppearance}</p></div></li>
                {history.map((event) => <li key={event.revision}><span>{STORY_RELEASES[event.revision].id}</span><div><strong>{changeLabels[event.kind]}</strong><p>{storyEventDetail(event, locale)}</p></div></li>)}
              </ol>
            </> : null}
            {chapter === 4 ? <div className={styles.reviewNote}>
              <p className={styles.evidenceLabel}>{copy.reviewBrief}</p>
              <h3>{copy.reviewTitle}</h3>
              <p>{element.revisionCount > 0 ? copy.reviewText(element.revisionCount, release.id) : copy.reviewInitial}</p>
              <div className={styles.reviewSource}><span>{copy.sourceHistory}</span><strong>R01 → {release.id}</strong></div>
              <div className={styles.reviewSource}><span>{copy.reviewScope}</span><strong>ARC · STR · MEP</strong></div>
              <span className={styles.reviewQuestion}>{copy.questionLabel}</span>
              <p>{copy.question}</p>
            </div> : null}
          </div>
          <p className={styles.takeaway}>{current.takeaway}</p>
          {chapter < chapters.length - 1 ? <button type="button" className={styles.next} onClick={() => { chooseChapter(chapter + 1); tabRefs.current[chapter + 1]?.focus(); }}>{copy.next(chapters[chapter + 1].label)}<span aria-hidden="true">→</span></button> : <a className={styles.next} href="#demo">{copy.seeProduct}<span aria-hidden="true">↗</span></a>}
        </aside>
      </div>
      <div className={styles.footnote}><p>{copy.footnote}</p><span>{failed ? copy.staticModel : copy.continuousHistory}</span></div>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{copy.liveRegion(release.id, summary.changedNow, summary.repeated, STORY_ELEMENTS.length)}</p>
    </div>
  );
}
