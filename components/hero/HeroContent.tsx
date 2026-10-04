import { CampaignContactLink } from "@/components/campaign/CampaignContactLink";
import { CountdownTimer } from "@/components/launch/CountdownTimer";
import type { HomeContent } from "@/content/home";
import { getRemainingTime, hasLaunched, launchTimestamp } from "@/lib/launch";
import styles from "./hero.module.css";

// This stays a server component; marketing copy and links never depend on WebGL.
export function HeroContent({ content }: { content: HomeContent }) {
  const launchDate = new Intl.DateTimeFormat(content.locale === "fi" ? "fi-FI" : "en-GB", {
    dateStyle: "medium", timeZone: "Europe/Helsinki"
  }).format(new Date(launchTimestamp));

  return (
    <div className={`home-hero-copy ${styles.copy}`}>
      <p className={`eyebrow ${styles.eyebrow}`}>{content.hero.eyebrow}</p>
      <div className={styles.headlines}>
        <h1 id="home-hero-title" className={styles.initialHeadline}>
          {content.hero.title}<span>{content.hero.titleEmphasis}</span>
        </h1>
        <h2 className={styles.finalHeadline}>
          {content.hero.experience.finalTitle}<span>{content.hero.experience.finalEmphasis}</span>
        </h2>
      </div>
      <p className={`home-hero-lead ${styles.lead}`}>{content.hero.description}</p>
      <div className={`home-hero-actions ${styles.actions}`}>
        <a className="btn btn-primary" href={content.locale === "en" ? "#demo" : "#workflow"}>
          {content.hero.primaryCta}<span aria-hidden="true">↗</span>
        </a>
        {content.locale === "en" ? (
          <CampaignContactLink className="btn btn-secondary" interest="a BIMSpect walkthrough" label={content.hero.secondaryCta} />
        ) : (
          <a className="btn btn-secondary" href="#sample-report">{content.hero.secondaryCta}</a>
        )}
      </div>
      <p className="home-capabilities">
        {content.hero.capabilityOne} <span aria-hidden="true">·</span> IFC2x3 / IFC4
        <span aria-hidden="true">·</span> {content.hero.capabilityTwo}
      </p>
      {!hasLaunched() ? (
        <aside className="home-launch-status" aria-label={content.launch.ariaLabel}>
          <div><span>{content.launch.label}</span><strong>{launchDate}</strong></div>
          <CountdownTimer initialRemaining={getRemainingTime()} labels={content.launch.countdownLabels} ariaLabel={content.launch.countdownAriaLabel} />
        </aside>
      ) : null}
    </div>
  );
}
