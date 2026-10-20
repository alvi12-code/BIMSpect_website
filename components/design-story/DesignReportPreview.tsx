import { getStoryElements, getStorySummary, STORY_EVENTS, STORY_RELEASES, STORY_SELECTED_ELEMENT, type StoryLocale } from "./story-data";
import { storyCopy } from "./story-copy";
import styles from "./design-story.module.css";

export function DesignReportPreview({ locale = "en" }: { locale?: StoryLocale }) {
  const copy = storyCopy[locale].report;
  const summary = getStorySummary(5);
  const route = getStoryElements(5).find((element) => element.id === STORY_SELECTED_ELEMENT)!;
  const releaseCounts = STORY_RELEASES.map((release, index) => ({ ...release, count: STORY_EVENTS.filter((event) => event.revision === index).length }));
  return <figure className={styles.reportPreview}>
    <div className={styles.reportBrand}><span>BIMSpect</span><span>{copy.badge}</span></div>
    <p className={styles.reportOverline}>NORTHLINE · R01—R06</p>
    <h3>{copy.titleOne}<br />{copy.titleTwo}</h3>
    <dl className={styles.reportStats}>
      <div><dt>{copy.releases}</dt><dd>{STORY_RELEASES.length}</dd></div>
      <div><dt>{copy.events}</dt><dd>{summary.events}</dd></div>
      <div><dt>{copy.repeated}</dt><dd>{summary.repeated}</dd></div>
    </dl>
    <div className={styles.reportChart} role="img" aria-label={copy.chart(releaseCounts.map((release) => `${release.id}: ${release.count}`).join(", "))}>
      {releaseCounts.map((release) => <div key={release.id}><div><i style={{ height: `${Math.max(2, release.count * 10)}px` }} /></div><span>{release.id}</span></div>)}
    </div>
    <div className={styles.reportFinding}><span>{copy.focus}</span><p><strong>{copy.focusTitle}</strong> {copy.focusBody(route.revisionCount)}</p></div>
    <figcaption>{copy.caption}</figcaption>
  </figure>;
}
