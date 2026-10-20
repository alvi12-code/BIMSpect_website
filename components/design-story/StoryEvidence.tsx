import type { Ref } from "react";
import {
  STORY_ELEMENTS, STORY_INTERFACE_ELEMENTS, STORY_RELEASES, STORY_REVIEW, STORY_SOURCES,
  getStoryElementHistory, getStoryElementProperties, getStoryElements, getStoryEvent,
  getStoryReview, getStorySummary, type StoryDisciplineFilter,
} from "./story-data";
import styles from "./design-story.module.css";

export const CHANGE_LABELS = { geometry: "Geometry", movement: "Movement", information: "Information" };

export function SourcesEvidence({ revision, discipline, onDiscipline }: {
  revision: number;
  discipline: StoryDisciplineFilter;
  onDiscipline: (value: StoryDisciplineFilter) => void;
}) {
  return <div className={styles.sourceCards}>
    {STORY_SOURCES.map((source) => <button type="button" key={source.discipline}
      aria-pressed={discipline === source.discipline}
      onClick={() => onDiscipline(discipline === source.discipline ? "all" : source.discipline)}>
      <span className={styles.sourceCode}>{source.discipline}</span>
      <span><strong>{source.label}</strong><small>{source.description}</small><span className={styles.sourceFile}>{source.filePrefix + "_" + STORY_RELEASES[revision].id + ".ifc"}</span></span>
      <span aria-hidden="true">↗</span>
    </button>)}
    <p className={styles.scopeNote}>Three discipline sources, six coordinated sample releases. Select a source to see its contribution.</p>
  </div>;
}

export function PatternEvidence({ revision, discipline, onDiscipline, onInspect }: {
  revision: number;
  discipline: StoryDisciplineFilter;
  onDiscipline: (value: StoryDisciplineFilter) => void;
  onInspect: (elementId: string, revision?: number) => void;
}) {
  const summary = getStorySummary(revision, discipline);
  const whole = getStorySummary(revision);
  const recurring = getStoryElements(revision).filter((element) => element.revisionCount > 1 && (discipline === "all" || element.discipline === discipline));
  return <>
    <div className={styles.patternComparison}>
      <div><strong>{summary.changedNow}</strong><span>changed in {STORY_RELEASES[revision].id}</span></div>
      <div><strong>{summary.repeated}</strong><span>changed repeatedly</span></div>
    </div>
    <p className={styles.scopeNote}>{summary.totalTracked} tracked elements in this scope · R01–{STORY_RELEASES[revision].id}</p>
    <p className={styles.evidenceLabel}>All tracked disciplines · events through {STORY_RELEASES[revision].id}</p>
    <div className={styles.patternBars}>
      {whole.disciplines.map((item) => <button type="button" key={item.discipline} aria-pressed={discipline === item.discipline}
        onClick={() => onDiscipline(discipline === item.discipline ? "all" : item.discipline)}>
        <span>{item.discipline}</span><span className={styles.patternTrack}><i style={{ width: (item.events / Math.max(1, ...whole.disciplines.map((entry) => entry.events)) * 100) + "%" }} /></span><strong>{item.events}</strong>
      </button>)}
    </div>
    <div className={styles.relatedChoices}>
      <p className={styles.evidenceLabel}>Follow a recurring element</p>
      {recurring.length ? recurring.map((element) => <button type="button" key={element.id} onClick={() => onInspect(element.id)}>
        <span><strong>{element.label}</strong><small>{element.discipline} · {element.id}</small></span><span>{element.revisionCount}<small>changes</small></span>
      </button>) : <p className={styles.emptyEvidence}>No element in this scope has changed more than once through {STORY_RELEASES[revision].id}.</p>}
    </div>
    <dl className={styles.factRow}><div><dt>Recorded events</dt><dd>{summary.events}</dd></div><div><dt>Distinct elements changed</dt><dd>{summary.uniqueChanged}<span> / {summary.totalTracked}</span></dd></div></dl>
  </>;
}

export function ElementEvidence({ elementId, revision, onInspect, headingRef }: {
  elementId: string | null;
  revision: number;
  onInspect: (elementId: string, revision?: number) => void;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  const element = getStoryElements(revision).find((item) => item.id === elementId);
  if (!element) return <div className={styles.relatedChoices}>
    <p className={styles.evidenceLabel}>Three elements. One shared interface.</p>
    {STORY_INTERFACE_ELEMENTS.map((id) => {
      const item = getStoryElements(revision).find((entry) => entry.id === id)!;
      return <button type="button" key={id} onClick={() => onInspect(id)}><span><strong>{item.label}</strong><small>{item.discipline} · {item.zone}</small></span><span aria-hidden="true">↗</span></button>;
    })}
  </div>;
  const event = getStoryEvent(element.id, revision);
  const history = getStoryElementHistory(element.id, revision);
  const properties = getStoryElementProperties(element.id, revision);
  const release = STORY_RELEASES[revision];
  return <>
    <div className={styles.elementLabel}><span className={styles.elementDot} /><div><h3 ref={headingRef} tabIndex={-1}>{element.label}</h3><span>{element.id} · {element.zone}</span></div></div>
    <div className={styles.eventDetail}>
      <p className={styles.evidenceLabel}>{release.id} · {event ? CHANGE_LABELS[event.kind] + " change" : revision === 0 ? "Initial baseline" : "No recorded change"}</p>
      <p>{event?.detail ?? (revision === 0 ? "The first recorded state of this element." : "This element has no new event in the selected release. Its earlier history remains below.")}</p>
      {event?.propertyChange ? <div className={styles.propertyChange}>
        <strong>{event.propertyChange.label}</strong>
        <dl><div><dt>Before</dt><dd>{event.propertyChange.before}</dd></div><div><dt>At {release.id}</dt><dd>{event.propertyChange.after}</dd></div></dl>
        <p>The information changed. The shape stayed the same.</p>
      </div> : event ? <p className={styles.scopeNote}>Use the previous-shape outline to locate the earlier state.</p> : null}
    </div>
    {properties.length ? <details className={styles.propertyDisclosure}>
      <summary>Properties at {release.id}<span>{properties.length}</span></summary>
      <dl>{properties.map((property) => <div key={property.key}><dt>{property.label}</dt><dd>{property.value}</dd></div>)}</dl>
    </details> : null}
    <div className={styles.historyHeading}><p className={styles.evidenceLabel}>Recorded history through {release.id}</p><span>{history.length} {history.length === 1 ? "change" : "changes"}</span></div>
    <ol className={styles.eventHistory}>
      <li><button type="button" aria-pressed={revision === 0} onClick={() => onInspect(element.id, 0)}><span>R01</span><span><strong>Initial element</strong><small>Baseline model state</small></span></button></li>
      {history.map((item) => <li key={item.revision}><button type="button" aria-pressed={revision === item.revision} onClick={() => onInspect(element.id, item.revision)}>
        <span>{STORY_RELEASES[item.revision].id}</span><span><strong>{CHANGE_LABELS[item.kind]}</strong><small>{item.detail}</small></span>
      </button></li>)}
    </ol>
  </>;
}

export function ReviewEvidence({ revision, onViewContext, onInspect }: {
  revision: number;
  onViewContext: (revision: number) => void;
  onInspect: (elementId: string, revision?: number) => void;
}) {
  const evidence = getStoryReview(revision);
  const source = STORY_RELEASES[STORY_REVIEW.createdRevision];
  if (!evidence.available) return <div className={styles.reviewNote}>
    <p className={styles.evidenceLabel}>Illustrative review</p><h3>Review begins at {source.id}.</h3>
    <p>You are viewing {STORY_RELEASES[revision].id}. The review has not yet been recorded in this sample history.</p>
    <button className={styles.inlineAction} type="button" onClick={() => onViewContext(STORY_REVIEW.createdRevision)}>See the captured review <span aria-hidden="true">→</span></button>
  </div>;
  return <>
    <div className={styles.reviewNote}>
      <div className={styles.reviewHeading}><p className={styles.evidenceLabel}>Illustrative review · {STORY_REVIEW.id}</p><span>{STORY_REVIEW.status}</span></div>
      <h3>{STORY_REVIEW.title}</h3><p>{STORY_REVIEW.question}</p>
      <p className={styles.scopeNote}>Shared review · ARC / STR / MEP. Its original three-discipline scope is retained.</p>
      <div className={styles.reviewSource}><span>Captured source</span><strong>R01 → {source.id}</strong></div>
      <div className={styles.reviewSource}><span>Original evidence</span><strong>{evidence.evidenceEvents.length} events · {STORY_REVIEW.elementIds.length} elements</strong></div>
      <button className={styles.inlineAction} type="button" onClick={() => onViewContext(STORY_REVIEW.createdRevision)}>View {source.id} context <span aria-hidden="true">↗</span></button>
    </div>
    <div className={styles.reviewUpdates}>
      <p className={styles.evidenceLabel}>Since the review · through {STORY_RELEASES[revision].id}</p>
      <h3>{evidence.changedElementIds.length ? evidence.changedElementIds.length + " referenced " + (evidence.changedElementIds.length === 1 ? "element changed" : "elements changed") : "No later changes in this view"}</h3>
      {evidence.laterEvents.length ? <>
        <p>{evidence.laterEvents.length} later {evidence.laterEvents.length === 1 ? "event" : "events"}. Compare them with the captured review context.</p>
        <ul>{evidence.laterEvents.map((event) => <li key={event.elementId + ":" + event.revision}><button type="button" onClick={() => onInspect(event.elementId, event.revision)}>
          <span>{STORY_RELEASES[event.revision].id}</span><span><strong>{STORY_ELEMENTS.find((element) => element.id === event.elementId)?.label}</strong><small>{event.detail}</small></span><span aria-hidden="true">↗</span>
        </button></li>)}</ul>
      </> : <p>The selected view ends at the review&apos;s source release. Explore R05 or R06 to follow later changes.</p>}
      <p className={styles.scopeNote}>Review status remains Open. Source changes give the team a reason to look again.</p>
    </div>
  </>;
}
