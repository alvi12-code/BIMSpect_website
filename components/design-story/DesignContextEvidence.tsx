import { getStoryElements, STORY_SELECTED_ELEMENT } from "./story-data";
import styles from "./design-story.module.css";

export function DesignContextEvidence() {
  const elements = getStoryElements(5);
  const related = ["ARC-112", "STR-028", STORY_SELECTED_ELEMENT].map((id) => elements.find((element) => element.id === id)!);
  return <figure className={styles.contextEvidence}>
    <p>THE SAME STORY · A WIDER VIEW</p>
    <h3>Three disciplines.<br />One review conversation.</h3>
    <div className={styles.contextRows}>
      {related.map((element) => <div key={element.id}>
        <span>{element.discipline}</span><div><strong>{element.label}</strong><span>{element.id} · R01–R06</span></div><span>{element.revisionCount} changes</span>
      </div>)}
    </div>
    <p>Illustrative east-wing review scope from the model above. A shared location gives the team a starting point; the history alone does not establish cause or a clash.</p>
  </figure>;
}
