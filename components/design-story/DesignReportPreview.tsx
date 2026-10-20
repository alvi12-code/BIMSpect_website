import {
  STORY_RELEASES, STORY_REVIEW, STORY_SELECTED_ELEMENT, STORY_SOURCES,
  clampStoryRevision, getStoryElements, getStoryReview, getStorySummary,
  type StoryDisciplineFilter,
  type StoryLocale,
} from "./story-data";
import { storyCopy, storyElementText } from "./story-copy";
import styles from "./design-story.module.css";

export function DesignReportPreview({ revision = 5, discipline = "all", selectedElementId = null, locale = "en" }: {
  revision?: number;
  discipline?: StoryDisciplineFilter;
  selectedElementId?: string | null;
  locale?: StoryLocale;
}) {
  const selectedRevision = clampStoryRevision(revision);
  const copy = storyCopy[locale].report;
  const fi = locale === "fi";
  const release = STORY_RELEASES[selectedRevision];
  const summary = getStorySummary(selectedRevision, discipline);
  const review = getStoryReview(selectedRevision);
  const sourceLabel = discipline === "all" ? (fi ? "Kaikki suunnittelualat" : "All disciplines") : STORY_SOURCES.find((source) => source.discipline === discipline)!.label;
  const elements = getStoryElements(selectedRevision);
  const focus = elements.find((element) => element.id === (selectedElementId ?? STORY_SELECTED_ELEMENT) && (discipline === "all" || element.discipline === discipline))
    ?? elements.find((element) => element.discipline === discipline);
  const releaseCounts = STORY_RELEASES.slice(0, selectedRevision + 1).map((item, index) => ({ ...item, count: getStorySummary(index, discipline).changedNow }));
  return <figure className={styles.reportPreview} data-story-report data-report-revision={selectedRevision}>
    <div className={styles.reportBrand}><span>BIMSpect</span><span>{copy.badge}</span></div>
    <p className={styles.reportOverline}>NORTHLINE · R01—{release.id} · {sourceLabel}</p>
    <h3>{copy.titleOne}<br />{copy.titleTwo}</h3>
    <dl className={styles.reportStats}>
      <div><dt>{copy.releases}</dt><dd>{selectedRevision + 1}</dd></div>
      <div><dt>{copy.events}</dt><dd>{summary.events}</dd></div>
      <div><dt>{copy.repeated}</dt><dd>{summary.repeated}</dd></div>
    </dl>
    <div className={styles.reportChart} role="img" aria-label={copy.chart(releaseCounts.map((item) => item.id + ": " + item.count).join(", "))}>
      {releaseCounts.map((item) => <div key={item.id}><div><i style={{ height: Math.max(2, item.count * 10) + "px" }} /></div><span>{item.id}</span></div>)}
    </div>
    {focus ? <div className={styles.reportFinding}><span>{focus.id === selectedElementId ? (fi ? "VALITTU NÄYTTÖ" : "SELECTED EVIDENCE") : (fi ? "ESIMERKKIKOHDE" : "EXAMPLE FOCUS")} · {focus.id}</span><p><strong>{storyElementText(focus, locale).label}.</strong> {storyCopy[locale].recordedChanges(focus.revisionCount)} {fi ? "julkaisuun" : "through"} {release.id}. {fi ? "Lähde" : "Source"}: {focus.discipline} · {storyElementText(focus, locale).zone}.</p></div> : null}
    <div className={styles.reportFinding}><span>{fi ? "YHTEINEN TARKASTELUKONTEKSTI" : "SHARED REVIEW CONTEXT"} · ARC / STR / MEP</span>
      {review.available ? <p><strong>{STORY_REVIEW.title}.</strong> Captured at R04. {review.changedElementIds.length ? review.changedElementIds.length + (review.changedElementIds.length === 1 ? " referenced element has" : " referenced elements have") + " changed across " + review.laterEvents.length + (review.laterEvents.length === 1 ? " later event" : " later events") + " through " + release.id + "." : "No later changes are included in this view."} Review status: Open.</p>
        : <p>The example review is recorded at R04. It does not yet exist at {release.id}.</p>}
    </div>
    <figcaption>{fi ? `Havainnollistava yhteenveto ${summary.totalTracked} seuratusta esimerkkielementistä julkaisuun ${release.id} asti. Yhteinen tarkastelukonteksti säilyttää alkuperäisen kolmen suunnittelualan laajuuden. Ei asiakasraportti eikä tekninen arvio.` : `Illustrative summary of ${summary.totalTracked} tracked example elements through ${release.id}. Shared review context retains its original three-discipline scope. Not a customer report or an engineering assessment.`}</figcaption>
  </figure>;
}
