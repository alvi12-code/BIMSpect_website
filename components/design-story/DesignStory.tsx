"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useReducer, useRef, useState, type KeyboardEvent } from "react";
import { StoryFallback } from "./StoryFallback";
import { SceneBoundary } from "@/components/models/SceneBoundary";
import { DesignReportPreview } from "./DesignReportPreview";
import { CHANGE_LABELS, ElementEvidence, PatternEvidence, ReviewEvidence, SourcesEvidence } from "./StoryEvidence";
import {
  STORY_ELEMENTS, STORY_EVENTS, STORY_INTERFACE_ELEMENTS, STORY_RELEASES, STORY_SOURCES,
  getStoryElements, getStoryEvent, getStorySummary, type StoryDisciplineFilter,
} from "./story-data";
import { INITIAL_STORY_SELECTION, storyReducer } from "./story-state";
import type { StoryLocale } from "./story-data";
import { storyCopy } from "./story-copy";
import styles from "./design-story.module.css";

const StoryScene = dynamic(() => import("./StoryScene").then((module) => module.StoryScene), { ssr: false });

const enChapters = [
  { label: "Connect the sources", kicker: "One project, several perspectives", title: "Every discipline.\nPart of the picture.", body: "Architecture, structure and services contribute to one evolving design. Follow their sources through six coordinated sample releases.", takeaway: "Start with the sources and the sequence." },
  { label: "Follow the changes", kicker: "A change you can understand", title: "See what moved.\nAnd what changed within.", body: "Follow geometry, movement and information changes. Choose an element to see the evidence behind its highlight.", takeaway: "A property update can matter even when the shape stays the same." },
  { label: "Find the pattern", kicker: "The longer view", title: "A quieter release.\nA busy history.", body: "Switch between this release and the history so far. See where change keeps returning, even when fewer elements change in the latest release.", takeaway: "The building shows where. Its history shows the pattern." },
  { label: "Inspect the evidence", kicker: "Three disciplines, one interface", title: "Choose an element.\nSee its story.", body: "Inspect the supply route, partition and beam in the east wing. Keep their shared location visible as you follow individual changes.", takeaway: "A shared location defines a useful review scope; it does not establish cause or a clash." },
  { label: "Keep reviews current", kicker: "From evidence to the next conversation", title: "The design moved on.\nDid the review?", body: "A sample review captures the interface at R04. Follow later releases to see when its referenced elements change, then preview the selected history.", takeaway: "Keep the original review context visible as the design develops." },
] as const;

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

export function DesignStory({ locale = "en" }: { locale?: StoryLocale }) {
  const copy = storyCopy[locale];
  const chapters = locale === "fi" ? copy.chapters : enChapters;
  const fi = locale === "fi";
  const [selection, dispatch] = useReducer(storyReducer, INITIAL_STORY_SELECTION);
  const { chapter, revision, discipline, selectedElementId, viewMode, modelView, showPrevious } = selection;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [loadScene, setLoadScene] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const reportHeading = useRef<HTMLHeadingElement>(null);
  const reportButton = useRef<HTMLButtonElement>(null);
  const evidencePanel = useRef<HTMLDivElement>(null);
  const elementHeading = useRef<HTMLHeadingElement>(null);
  const focusElementAfterInspect = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = chapters[chapter];
  const summary = getStorySummary(revision, discipline);
  const release = STORY_RELEASES[revision];
  const elements = getStoryElements(revision);
  const element = elements.find((item) => item.id === selectedElementId);
  const outsideInterface = chapter === 3 && element && !STORY_INTERFACE_ELEMENTS.some((id) => id === element.id);
  const selectedEvent = element ? getStoryEvent(element.id, revision) : undefined;
  const canShowPrevious = Boolean(selectedEvent && selectedEvent.kind !== "information");
  const currentEvents = STORY_EVENTS.filter((event) => event.revision === revision &&
    (discipline === "all" || STORY_ELEMENTS.find((item) => item.id === event.elementId)?.discipline === discipline));
  const sourceLabel = discipline === "all" ? "All disciplines" : STORY_SOURCES.find((source) => source.discipline === discipline)!.label;
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setFailed(true); setReady(false); }, []);
  const onInspect = useCallback((elementId: string, targetRevision?: number) => {
    focusElementAfterInspect.current = (chapter !== 3 || selectedElementId === null) && Boolean(evidencePanel.current?.contains(document.activeElement));
    dispatch({ type: "inspect", elementId, revision: targetRevision });
  }, [chapter, selectedElementId]);
  const onRevision = (value: number) => dispatch({ type: "revision", revision: value });
  const onDiscipline = (value: StoryDisciplineFilter) => dispatch({ type: "discipline", discipline: value });
  const rendererProps = { chapter, revision, selectedElementId, discipline, viewMode, modelView, showPrevious: showPrevious && canShowPrevious };

  useEffect(() => {
    if (focusElementAfterInspect.current && chapter === 3) {
      elementHeading.current?.focus({ preventScroll: true });
      focusElementAfterInspect.current = false;
    }
  }, [chapter, selectedElementId, revision]);

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

  useEffect(() => {
    if (reportOpen) {
      reportHeading.current?.focus({ preventScroll: true });
      reportHeading.current?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
    }
  }, [reportOpen, reduced]);

  function chooseChapter(index: number) { dispatch({ type: "chapter", chapter: index }); }
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
    <div ref={host} className={styles.experience} data-design-story data-chapter={chapter} data-revision={revision}
      data-discipline={discipline} data-mode={viewMode} data-selection={selectedElementId ?? "context"} data-view={modelView} data-renderer={ready && !failed ? "webgl" : "svg"}>
      <div className={styles.chapterTabs} role="tablist" aria-label={copy.tablist}>
        {chapters.map((item, index) => <button key={item.label} type="button" role="tab" id={"story-tab-" + index}
          aria-controls="story-chapter" aria-selected={chapter === index} tabIndex={chapter === index ? 0 : -1}
          onClick={() => chooseChapter(index)} onKeyDown={(event) => moveTab(event, index)} ref={(node) => { tabRefs.current[index] = node; }}>
          <span className={styles.tabNumber}>0{index + 1}</span><span>{item.label}</span>
        </button>)}
      </div>

      <div className={styles.stage} id="story-chapter" role="tabpanel" aria-labelledby={"story-tab-" + chapter}>
        <div className={styles.modelArea}>
          <div className={styles.modelTopline}>
            <div><span className={styles.projectMark} aria-hidden="true">N</span><div><strong>Northline</strong><span>{fi ? "Havainnollistava hanke" : "Illustrative project"} · {STORY_ELEMENTS.length} {fi ? "seurattua elementtiä" : "tracked elements"}</span></div></div>
            <div className={styles.releaseBadge}><i aria-hidden="true" />{release.id}<span>{release.date}</span></div>
          </div>
          <div className={styles.modelControls}>
            <div className={styles.segmented} role="group" aria-label={fi ? "Muutosnäkymä" : "Change view"}>
              <button type="button" aria-pressed={viewMode === "release"} onClick={() => dispatch({ type: "mode", mode: "release" })}>{fi ? "Tämä julkaisu" : "This release"}</button>
              <button type="button" aria-pressed={viewMode === "history"} onClick={() => dispatch({ type: "mode", mode: "history" })}>{fi ? "Historia tähän asti" : "History so far"}</button>
            </div>
            <div className={styles.segmented} role="group" aria-label={fi ? "Mallinäkymä" : "Model view"}>
              <button type="button" aria-pressed={modelView === "building"} onClick={() => dispatch({ type: "view", view: "building" })}>{fi ? "Koko rakennus" : "Whole building"}</button>
              <button type="button" aria-pressed={modelView === "interface"} onClick={() => dispatch({ type: "view", view: "interface" })}>{fi ? "Itäsiiven yksityiskohta" : "East-wing detail"}</button>
            </div>
          </div>
          <div className={styles.scene} role="img" aria-label={sourceLabel + ". " + release.id + ". " + (viewMode === "release" ? summary.changedNow + " tracked elements changed in this release." : summary.repeated + " tracked elements changed more than once through this release.") + (element ? " Selected: " + element.label + "." : "") + " The evidence and all controls are available as text below and alongside the model."}>
            <div className={cx(styles.fallback, ready && !failed && styles.fallbackHidden)}><StoryFallback {...rendererProps} /></div>
            {loadScene && !failed ? <div className={cx(styles.canvas, ready && styles.canvasReady)} aria-hidden="true">
              <SceneBoundary onFailure={onFailure}><StoryScene {...rendererProps} active={active} reduced={reduced} onReady={onReady} onFailure={onFailure} onSelectElement={onInspect} /></SceneBoundary>
            </div> : null}
            <div className={styles.sceneCaption}><span>{modelView === "interface" ? (fi ? "L03 / Itäsiiven rajapinta" : "L03 / East-wing interface") : (fi ? "Hankkeen konteksti" : "Project context")}</span><strong>{viewMode === "release" ? (fi ? `${summary.changedNow} muuttui julkaisussa ${release.id}` : summary.changedNow + " changed in " + release.id) : (fi ? `${summary.repeated} muuttui toistuvasti · R01–${release.id}` : summary.repeated + " changed repeatedly · R01–" + release.id)}</strong></div>
          </div>
          <div className={styles.modelLegend} aria-label={copy.legend}>
            <span><i className={styles.legendContext} />{fi ? "Konteksti" : "Context"}</span>
            <span><i className={viewMode === "history" ? styles.legendRepeat : styles.legendChange} />{viewMode === "history" ? copy.repeatedChange : copy.changedInRelease}</span>
            {element ? <span><i className={styles.legendChange} />{copy.selectedElement}</span> : null}
            {canShowPrevious ? <button type="button" className={styles.previousToggle} aria-pressed={showPrevious} onClick={() => dispatch({ type: "previous", show: !showPrevious })}><span aria-hidden="true">▱</span> {fi ? "Edellinen muoto" : "Previous shape"}</button> : null}
          </div>
          <div className={styles.disciplineFilters} role="group" aria-label="Discipline scope">
            <button type="button" aria-pressed={discipline === "all"} onClick={() => onDiscipline("all")}>All disciplines</button>
            {STORY_SOURCES.map((source) => <button type="button" key={source.discipline} aria-pressed={discipline === source.discipline} onClick={() => onDiscipline(source.discipline)}>{source.discipline}<span>{source.label}</span></button>)}
          </div>
          {chapter >= 2 ? <div className={styles.elementChips} role="group" aria-label="Inspect the east-wing interface">
            {STORY_INTERFACE_ELEMENTS.map((id) => {
              const item = STORY_ELEMENTS.find((entry) => entry.id === id)!;
              return <button type="button" key={id} aria-pressed={selectedElementId === id} onClick={() => onInspect(id)}><span>{item.discipline}</span>{item.kind === "duct" ? "Supply route" : item.kind === "beam" ? "Transfer beam" : "Room partition"}</button>;
            })}
            <button type="button" aria-pressed={selectedElementId === null && modelView === "interface"} onClick={() => dispatch({ type: "context" })}>All three in context</button>
          </div> : null}
          <div className={styles.timeline} role="group" aria-label="Choose an illustrative model release">
            <div className={styles.timelineHeading}><span>{sourceLabel} · {summary.totalTracked} tracked elements</span><button type="button" disabled={revision === STORY_RELEASES.length - 1} onClick={() => onRevision(STORY_RELEASES.length - 1)}>Return to latest ↗</button></div>
            <div className={styles.releaseButtons}>
              {STORY_RELEASES.map((item, index) => {
                const count = getStorySummary(index, discipline).changedNow;
                const event = element ? getStoryEvent(element.id, index) : undefined;
                return <button type="button" key={item.id} aria-pressed={revision === index}
                  aria-label={item.id + ", " + item.label + ", " + (index === 0 ? "initial baseline" : count + " tracked elements changed") + (element ? ", " + element.label + (event ? ": " + CHANGE_LABELS[event.kind] + " change" : ": no new event") : "")}
                  onClick={() => onRevision(index)}>
                  <span className={styles.releaseBar} aria-hidden="true"><i style={{ height: Math.max(3, count * 5) + "px" }} /></span><span>{item.id}</span><small>{item.date}</small>
                  {element ? <span className={cx(styles.eventMarker, Boolean(event) && styles.eventMarkerActive)} aria-hidden="true">{event ? "●" : "·"}</span> : null}
                </button>;
              })}
            </div>
            {element ? <p className={styles.timelineSelection}>● Recorded event for {element.label} · select a release to inspect it</p> : null}
          </div>
          <details className={styles.sourceLanes} open={chapter === 0}>
            <summary>Source model histories <span>ARC / STR / MEP</span></summary>
            {STORY_SOURCES.map((source) => <div key={source.discipline} className={styles.sourceLane}>
              <button type="button" className={styles.laneName} aria-pressed={discipline === source.discipline} onClick={() => onDiscipline(source.discipline)}>{source.discipline}</button>
              <div role="group" aria-label={source.label + " source releases"}>{STORY_RELEASES.map((item, index) => {
                const count = getStorySummary(index, source.discipline).changedNow;
                return <button type="button" key={item.id} aria-pressed={revision === index && (discipline === "all" || discipline === source.discipline)}
                  aria-label={source.label + " " + item.id + ", " + count + (count === 1 ? " tracked change" : " tracked changes")}
                  onClick={() => { onDiscipline(source.discipline); onRevision(index); }}><span>{item.id}</span><i className={count ? styles.laneEvent : undefined} aria-hidden="true" /></button>;
              })}</div>
            </div>)}
            <p>Aligned sample releases. Each lane identifies its own source model.</p>
          </details>
        </div>

        <aside className={styles.insight} aria-label="Design story evidence">
          <p className={styles.insightKicker}><span>0{chapter + 1}</span>{outsideInterface ? "Evidence for this element" : current.kicker}</p><h2>{current.title}</h2>
          <p className={styles.insightBody}>{outsideInterface ? "Follow " + element.label.toLowerCase() + " in " + element.zone + ". See its recorded changes and properties in the context of each release." : chapter === 2 && revision < 2 ? "Follow the early releases first. Repeated changes become visible only when the same element changes again." : current.body}</p>
          <div className={styles.evidence} ref={evidencePanel}>
            {chapter === 0 ? <><SourcesEvidence revision={revision} discipline={discipline} onDiscipline={onDiscipline} /><dl className={styles.factRow}><div><dt>History through {release.id}</dt><dd>{revision + 1}<span> / 6 releases</span></dd></div><div><dt>Elements in this scope</dt><dd>{summary.totalTracked}</dd></div></dl></> : null}
            {chapter === 1 ? <>
              <p className={styles.evidenceLabel}>{sourceLabel} · {release.id}</p><strong className={styles.largeMetric}>{summary.changedNow}<span> / {summary.totalTracked} changed</span></strong>
              <ul className={styles.changeKinds}>{Object.entries(CHANGE_LABELS).map(([kind, label]) => <li key={kind}><span>{label}</span><strong>{currentEvents.filter((event) => event.kind === kind).length}</strong></li>)}</ul>
              <div className={styles.relatedChoices}><p className={styles.evidenceLabel}>Select a change to inspect</p>{currentEvents.length ? currentEvents.map((event) => <button type="button" key={event.elementId} onClick={() => onInspect(event.elementId)}><span><strong>{STORY_ELEMENTS.find((item) => item.id === event.elementId)?.label}</strong><small>{CHANGE_LABELS[event.kind]} · {event.detail}</small></span><span aria-hidden="true">↗</span></button>) : <p className={styles.emptyEvidence}>{revision === 0 ? "R01 establishes the baseline. Choose another release to follow the changes." : "No new events in this discipline for the selected release."}</p>}</div>
            </> : null}
            {chapter === 2 ? <PatternEvidence revision={revision} discipline={discipline} onDiscipline={onDiscipline} onInspect={onInspect} /> : null}
            {chapter === 3 ? <ElementEvidence elementId={selectedElementId} revision={revision} onInspect={onInspect} headingRef={elementHeading} /> : null}
            {chapter === 4 ? <><ReviewEvidence revision={revision} onViewContext={(value) => { dispatch({ type: "context" }); onRevision(value); }} onInspect={onInspect} /><button type="button" ref={reportButton} className={styles.reportAction} aria-expanded={reportOpen} aria-controls="story-report" onClick={() => setReportOpen(!reportOpen)}>{reportOpen ? "Hide illustrative report" : "Preview this history"}<span aria-hidden="true">↗</span></button></> : null}
          </div>
          <p className={styles.takeaway}>{outsideInterface ? "Read the selected element against its source and release history." : current.takeaway}</p>
          {chapter < chapters.length - 1 ? <button type="button" className={styles.next} onClick={() => { chooseChapter(chapter + 1); tabRefs.current[chapter + 1]?.focus(); }}>Next: {chapters[chapter + 1].label.toLowerCase()}<span aria-hidden="true">→</span></button> : <a className={styles.next} href="#demo">See the real product<span aria-hidden="true">↗</span></a>}
        </aside>
      </div>
      {reportOpen ? <section id="story-report" className={styles.reportDock} aria-labelledby="story-report-heading">
        <div className={styles.reportIntroduction}>
          <p className={styles.insightKicker}>FROM THE HISTORY YOU SELECTED</p><h3 id="story-report-heading" ref={reportHeading} tabIndex={-1}>The same evidence.<br />Ready to discuss.</h3>
          <p>This illustrative report follows your selected release and discipline scope. The model, event counts and review context stay connected.</p>
          <label>Report through<select aria-label="Report through release" value={revision} onChange={(event) => onRevision(Number(event.target.value))}>{STORY_RELEASES.map((item, index) => <option key={item.id} value={index}>{item.id} · {item.date}</option>)}</select></label>
          <p className={styles.scopeNote}>{sourceLabel} · {summary.totalTracked} tracked example elements</p>
          <a className={styles.inlineAction} href="#demo">Watch the real product walkthrough <span aria-hidden="true">↗</span></a>
          <button type="button" className={styles.inlineAction} onClick={() => { setReportOpen(false); (reportButton.current ?? tabRefs.current[chapter])?.focus(); }}>Close report preview <span aria-hidden="true">×</span></button>
        </div>
        <DesignReportPreview revision={revision} discipline={discipline} selectedElementId={selectedElementId} locale={locale} />
      </section> : null}
      <div className={styles.footnote}><p>Illustrative project and source history · 12 tracked elements · six coordinated releases.</p><span>{failed ? "Static rendering · All evidence controls available" : "One connected design history"}</span></div>
      <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{sourceLabel}. {release.id}. {summary.changedNow} of {summary.totalTracked} tracked elements changed in this release. {summary.repeated} changed repeatedly through this release.{element ? " Selected: " + element.label + "." : ""}</p>
    </div>
  );
}
