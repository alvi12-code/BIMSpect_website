import { getStoryElements, STORY_SELECTED_ELEMENT, type StoryLocale } from "./story-data";
import { storyCopy, storyElementText } from "./story-copy";
import styles from "./design-story.module.css";

export function DesignContextEvidence({ locale = "en" }: { locale?: StoryLocale }) {
  const copy = storyCopy[locale].context;
  const elements = getStoryElements(5);
  const related = ["ARC-112", "STR-028", STORY_SELECTED_ELEMENT].map((id) => elements.find((element) => element.id === id)!);
  return <figure className={styles.contextEvidence}>
    <p>{copy.overline}</p>
    <h3>{copy.titleOne}<br />{copy.titleTwo}</h3>
    <div className={styles.contextRows}>
      {related.map((element) => <div key={element.id}>
        <span>{element.discipline}</span><div><strong>{storyElementText(element, locale).label}</strong><span>{element.id} · R01–R06</span></div><span>{copy.changes(element.revisionCount)}</span>
      </div>)}
    </div>
    <p>{copy.note}</p>
  </figure>;
}
