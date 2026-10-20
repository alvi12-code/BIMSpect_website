import { CampaignContactLink } from "@/components/campaign/CampaignContactLink";
import { CountdownTimer } from "@/components/launch/CountdownTimer";
import type { HomeContent } from "@/content/home";
import { getRemainingTime, hasLaunched, launchTimestamp } from "@/lib/launch";
import { DesignStory } from "./DesignStory";
import styles from "./design-story.module.css";

/** Server-rendered story and enquiry links remain usable without WebGL. */
export function DesignStoryHero({ content }: { content: HomeContent }) {
  const launchDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium", timeZone: "Europe/Helsinki",
  }).format(new Date(launchTimestamp));
  return (
    <div className={styles.hero}>
      <div className={styles.intro}>
        <div>
          <p className={styles.eyebrow}><span />{content.hero.eyebrow}</p>
          <h1 id="home-hero-title">{content.hero.title}<span>{content.hero.titleEmphasis}</span></h1>
        </div>
        <div className={styles.introCopy}>
          <p>{content.hero.description}</p>
          <div className={styles.actions}>
            <a className="btn btn-primary" href="#demo">{content.hero.primaryCta}<span aria-hidden="true">↗</span></a>
            <CampaignContactLink className={styles.textLink} interest="a BIMSpect walkthrough" label={content.hero.secondaryCta} />
          </div>
          <p className={styles.capabilities}>{content.hero.capabilityOne}<span>·</span>IFC2x3 / IFC4<span>·</span>{content.hero.capabilityTwo}</p>
        </div>
      </div>
      <DesignStory />
      {!hasLaunched() ? (
        <aside className={`home-launch-status ${styles.launch}`} aria-label={content.launch.ariaLabel}>
          <div><span>{content.launch.label}</span><strong>{launchDate}</strong></div>
          <CountdownTimer initialRemaining={getRemainingTime()} labels={content.launch.countdownLabels} ariaLabel={content.launch.countdownAriaLabel} />
        </aside>
      ) : null}
    </div>
  );
}
