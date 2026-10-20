import { getStoryElements, getStorySummary, STORY_EVENTS, STORY_RELEASES, STORY_SELECTED_ELEMENT } from "./story-data";
import styles from "./design-story.module.css";

export function DesignReportPreview() {
  const summary = getStorySummary(5);
  const route = getStoryElements(5).find((element) => element.id === STORY_SELECTED_ELEMENT)!;
  const releaseCounts = STORY_RELEASES.map((release, index) => ({ ...release, count: STORY_EVENTS.filter((event) => event.revision === index).length }));
  return <figure className={styles.reportPreview}>
    <div className={styles.reportBrand}><span>BIMSpect</span><span>ILLUSTRATIVE SUMMARY</span></div>
    <p className={styles.reportOverline}>NORTHLINE · R01—R06</p>
    <h3>Design history.<br />Ready for the conversation.</h3>
    <dl className={styles.reportStats}>
      <div><dt>Model releases</dt><dd>{STORY_RELEASES.length}</dd></div>
      <div><dt>Tracked change events</dt><dd>{summary.events}</dd></div>
      <div><dt>Repeatedly changed elements</dt><dd>{summary.repeated}</dd></div>
    </dl>
    <div className={styles.reportChart} role="img" aria-label={`Tracked elements changed per release: ${releaseCounts.map((release) => `${release.id}: ${release.count}`).join(", ")}`}>
      {releaseCounts.map((release) => <div key={release.id}><div><i style={{ height: `${Math.max(2, release.count * 10)}px` }} /></div><span>{release.id}</span></div>)}
    </div>
    <div className={styles.reportFinding}><span>REVIEW FOCUS</span><p><strong>East-wing service interface.</strong> The supply route changed in {route.revisionCount} releases. Bring its history and the related partition and beam into the coordination review.</p></div>
    <figcaption>Illustrative summary of the same 12-element history shown above. Not a customer report or an engineering assessment.</figcaption>
  </figure>;
}
