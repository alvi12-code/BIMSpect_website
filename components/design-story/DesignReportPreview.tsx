import {
  STORY_RELEASES, STORY_REVIEW, STORY_SELECTED_ELEMENT, STORY_SOURCES,
  clampStoryRevision, getStoryElements, getStoryReview, getStorySummary,
  type StoryDisciplineFilter,
} from "./story-data";
import styles from "./design-story.module.css";

export function DesignReportPreview({ revision = 5, discipline = "all", selectedElementId = null }: {
  revision?: number;
  discipline?: StoryDisciplineFilter;
  selectedElementId?: string | null;
}) {
  const selectedRevision = clampStoryRevision(revision);
  const release = STORY_RELEASES[selectedRevision];
  const summary = getStorySummary(selectedRevision, discipline);
  const review = getStoryReview(selectedRevision);
  const sourceLabel = discipline === "all" ? "All disciplines" : STORY_SOURCES.find((source) => source.discipline === discipline)!.label;
  const elements = getStoryElements(selectedRevision);
  const focus = elements.find((element) => element.id === (selectedElementId ?? STORY_SELECTED_ELEMENT) && (discipline === "all" || element.discipline === discipline))
    ?? elements.find((element) => element.discipline === discipline);
  const releaseCounts = STORY_RELEASES.slice(0, selectedRevision + 1).map((item, index) => ({ ...item, count: getStorySummary(index, discipline).changedNow }));
  return <figure className={styles.reportPreview} data-story-report data-report-revision={selectedRevision}>
    <div className={styles.reportBrand}><span>BIMSpect</span><span>ILLUSTRATIVE SUMMARY</span></div>
    <p className={styles.reportOverline}>NORTHLINE · R01—{release.id} · {sourceLabel}</p>
    <h3>Design history.<br />Ready for the conversation.</h3>
    <dl className={styles.reportStats}>
      <div><dt>Model releases</dt><dd>{selectedRevision + 1}</dd></div>
      <div><dt>Tracked change events</dt><dd>{summary.events}</dd></div>
      <div><dt>Repeatedly changed elements</dt><dd>{summary.repeated}</dd></div>
    </dl>
    <div className={styles.reportChart} role="img" aria-label={"Tracked elements changed per release: " + releaseCounts.map((item) => item.id + ": " + item.count).join(", ")}>
      {releaseCounts.map((item) => <div key={item.id}><div><i style={{ height: Math.max(2, item.count * 10) + "px" }} /></div><span>{item.id}</span></div>)}
    </div>
    {focus ? <div className={styles.reportFinding}><span>{focus.id === selectedElementId ? "SELECTED EVIDENCE" : "EXAMPLE FOCUS"} · {focus.id}</span><p><strong>{focus.label}.</strong> {focus.revisionCount} recorded {focus.revisionCount === 1 ? "change" : "changes"} through {release.id}. Source: {focus.discipline} · {focus.zone}.</p></div> : null}
    <div className={styles.reportFinding}><span>SHARED REVIEW CONTEXT · ARC / STR / MEP</span>
      {review.available ? <p><strong>{STORY_REVIEW.title}.</strong> Captured at R04. {review.changedElementIds.length ? review.changedElementIds.length + (review.changedElementIds.length === 1 ? " referenced element has" : " referenced elements have") + " changed across " + review.laterEvents.length + (review.laterEvents.length === 1 ? " later event" : " later events") + " through " + release.id + "." : "No later changes are included in this view."} Review status: Open.</p>
        : <p>The example review is recorded at R04. It does not yet exist at {release.id}.</p>}
    </div>
    <figcaption>Illustrative summary of {summary.totalTracked} tracked example elements through {release.id}. Shared review context retains its original three-discipline scope. Not a customer report or an engineering assessment.</figcaption>
  </figure>;
}
