import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header, type NavigationCta, type NavigationLink } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { CampaignAnalytics } from "./analytics";
import { campaignBusinessConfig, campaignFooterLinks } from "./content";
import styles from "./campaign.module.css";

type CampaignShellProps = {
  children: ReactNode;
  landingPage: "pilot" | "what-changed";
  navigation: NavigationLink[];
  navigationCta: Exclude<NavigationCta, null>;
};

export function CampaignShell({
  children,
  landingPage,
  navigation,
  navigationCta
}: CampaignShellProps) {
  return (
    <div className={styles.page}>
      <CampaignAnalytics
        landingPage={landingPage}
        campaign={campaignBusinessConfig.campaign}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Header
        links={navigation}
        cta={navigationCta}
        homeHref="/"
      />
      <main id="main-content">{children}</main>
      <Footer
        links={campaignFooterLinks}
        homeHref="/"
        useBrandImage
        copyrightText={landingPage === "pilot" ? "© 2026 BIMSpect" : undefined}
      />
    </div>
  );
}

type CampaignCta = {
  href: string;
  label: string;
  primary?: boolean;
};

type CampaignHeroProps = {
  eyebrow: string;
  heading: ReactNode;
  supportingCopy: string[];
  ctas: CampaignCta[];
  browserStatement?: ReactNode;
  visual?: ReactNode;
  visualFirstOnMobile?: boolean;
  className?: string;
};

export function CampaignHero({
  eyebrow,
  heading,
  supportingCopy,
  ctas,
  browserStatement,
  visual,
  visualFirstOnMobile = false,
  className
}: CampaignHeroProps) {
  return (
    <section
      id="home"
      className={[styles.hero, className ?? ""].filter(Boolean).join(" ")}
    >
      <div
        className={`wrap ${styles.heroGrid} ${
          visual ? "" : styles.heroGridSingle
        }`}
      >
        <div className={styles.heroCopy}>
          <p className={`eyebrow hero-load hero-load-1 ${styles.heroEyebrow}`}>
            {eyebrow}
          </p>
          <h1 className="hero-load hero-load-2">{heading}</h1>
          <div className={`hero-load hero-load-3 ${styles.heroBody}`}>
            {supportingCopy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className={`hero-ctas hero-load hero-load-4 ${styles.heroActions}`}>
            {ctas.map((cta) => (
              <a
                className={cta.primary ? "btn btn-primary" : "btn btn-secondary"}
                href={cta.href}
                key={cta.label}
              >
                {cta.label}
              </a>
            ))}
          </div>
          {browserStatement ? (
            <p className={`${styles.browserStatement} ${styles.heroBrowserStatement}`}>
              {browserStatement}
            </p>
          ) : null}
        </div>
        {visual ? (
          <div
            className={[
              styles.heroVisual,
              visualFirstOnMobile ? styles.heroVisualFirst : ""
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {visual}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  heading: string;
  copy?: string;
  centered?: boolean;
};

export function SectionHeading({
  eyebrow,
  heading,
  copy,
  centered = false
}: SectionHeadingProps) {
  return (
    <header
      className={[styles.sectionHeading, centered ? styles.centered : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? (
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
      ) : null}
      <Reveal as="h2" delay={80}>
        {heading}
      </Reveal>
      {copy ? (
        <Reveal as="p" delay={150}>
          {copy}
        </Reveal>
      ) : null}
    </header>
  );
}

type FinalCtaProps = {
  heading: string;
  copy?: string;
  actions: CampaignCta[];
};

export function FinalCta({ heading, copy, actions }: FinalCtaProps) {
  return (
    <section className={styles.finalCta}>
      <div className={`wrap ${styles.finalCtaInner}`}>
        <Reveal as="p" className="eyebrow">
          BIMSpect
        </Reveal>
        <Reveal as="h2" delay={80}>
          {heading}
        </Reveal>
        {copy ? (
          <Reveal as="p" delay={140}>
            {copy}
          </Reveal>
        ) : null}
        <Reveal className={styles.finalActions} delay={200}>
          {actions.map((action) => (
            <a
              className={action.primary ? "btn-white" : "btn-outline-white"}
              href={action.href}
              key={action.label}
            >
              {action.label}
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
