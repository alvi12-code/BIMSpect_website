import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeDemoVideo } from "@/components/HomeDemoVideo";
import { LanguageSuggestion } from "@/components/LanguageSuggestion";
import { CountdownTimer } from "@/components/launch/CountdownTimer";
import { ModelAttribution } from "@/components/ModelAttribution";
import { PricingSection } from "@/components/PricingSection";
import { Reveal } from "@/components/Reveal";
import { CampaignContactLink } from "@/components/campaign/CampaignContactLink";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import type { HomeContent, Locale } from "@/content/home";
import { getRemainingTime, hasLaunched, launchTimestamp } from "@/lib/launch";

type HomePageProps = {
  content: HomeContent;
  languageHref: string;
  shouldSuggestFinnish?: boolean;
};

function formatLaunchDate(locale: Locale) {
  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "en-GB", {
    dateStyle: "medium",
    timeZone: "Europe/Helsinki"
  }).format(new Date(launchTimestamp));
}

function CredibilitySections({ content }: { content: HomeContent }) {
  return (
    <>
      <section id="research" className="home-research" aria-labelledby="research-title">
        <div className="wrap home-wrap home-research-layout">
          <div>
            <Reveal as="p" className="eyebrow">
              {content.research.eyebrow}
            </Reveal>
            <Reveal as="h2" delay={70} id="research-title">
              {content.research.title}
            </Reveal>
          </div>
          <div className="home-research-facts">
            {content.research.facts.map((fact, index) => (
              <Reveal delay={index * 60} key={fact.title}>
                <h3>{fact.title}</h3>
                <p>{fact.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="home-team" aria-labelledby="team-title">
        <div className="wrap home-wrap">
          <div className="home-section-heading home-team-heading">
            <Reveal as="p" className="eyebrow">
              {content.team.eyebrow}
            </Reveal>
            <Reveal as="h2" delay={70} id="team-title">
              {content.team.title}
            </Reveal>
          </div>
          <div className="home-team-grid">
            {content.team.members.map((member, index) => (
              <Reveal className="home-team-member" delay={index * 55} key={member.initials}>
                <div
                  className={`home-team-portrait home-team-portrait-${member.initials.toLowerCase()}`}
                >
                  <Image
                    src={member.portrait.src}
                    alt={member.name}
                    width={member.portrait.width}
                    height={member.portrait.height}
                    sizes="(max-width: 700px) 100px, 140px"
                    style={{ objectPosition: member.portrait.objectPosition }}
                  />
                </div>
                <div className="home-team-member-content">
                  <h3>{member.name}</h3>
                  <p className="home-team-role">{member.role}</p>
                  <p className="home-team-bio">{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function HomePage({ content, languageHref, shouldSuggestFinnish = false }: HomePageProps) {
  const isLaunched = hasLaunched();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(content.structuredData).replace(/</g, "\\u003c")
        }}
      />
      <a className="skip-link" href="#main-content">
        {content.accessibility.skipToMain}
      </a>
      <Header
        variant="technical"
        links={content.navigation}
        cta={{ href: "#contact", label: content.headerCta }}
        languageSwitcher={{
          currentLabel: content.languageSwitcher.currentLabel,
          targetLabel: content.languageSwitcher.targetLabel,
          href: languageHref,
          ariaLabel: content.languageSwitcher.ariaLabel,
          targetLocale: content.locale === "en" ? "fi" : "en",
          navigationLabel: content.accessibility.mainNavigation,
          mobileNavigationLabel: content.accessibility.mobileNavigation,
          menuLabel: content.accessibility.menu,
          homeLabel: content.accessibility.home
        }}
      />
      {shouldSuggestFinnish && content.locale === "en" ? (
        <LanguageSuggestion
          destinationHref={languageHref}
          title={content.languageSuggestion.title}
          selectFinnish={content.languageSuggestion.selectFinnish}
          continueInEnglish={content.languageSuggestion.continueInEnglish}
          dismiss={content.languageSuggestion.dismiss}
        />
      ) : null}
      <main id="main-content" className="homepage">
        <section id="home" className="home-hero" aria-labelledby="home-hero-title">
          <div className="wrap home-wrap home-hero-grid">
            <div className="home-hero-copy">
              <p className="eyebrow">{content.hero.eyebrow}</p>
              <h1 id="home-hero-title">
                {content.hero.title}
                <span>{content.hero.titleEmphasis}</span>
              </h1>
              <p className="home-hero-lead">{content.hero.description}</p>
              <div className="home-hero-actions">
                <a
                  className="btn btn-primary"
                  href={content.locale === "en" ? "#demo" : "#workflow"}
                >
                  {content.hero.primaryCta}
                </a>
                {content.locale === "en" ? (
                  <CampaignContactLink
                    className="btn btn-secondary"
                    interest="a BIMSpect walkthrough"
                    label={content.hero.secondaryCta}
                  />
                ) : (
                  <a className="btn btn-secondary" href="#sample-report">
                    {content.hero.secondaryCta}
                  </a>
                )}
              </div>
              <p className="home-capabilities">
                {content.hero.capabilityOne} <span aria-hidden="true">·</span> IFC2x3 / IFC4
                <span aria-hidden="true">·</span> {content.hero.capabilityTwo}
              </p>
              {!isLaunched ? (
                <aside className="home-launch-status" aria-label={content.launch.ariaLabel}>
                  <div>
                    <span>{content.launch.label}</span>
                    <strong>{formatLaunchDate(content.locale)}</strong>
                  </div>
                  <CountdownTimer
                    initialRemaining={getRemainingTime()}
                    labels={content.launch.countdownLabels}
                    ariaLabel={content.launch.countdownAriaLabel}
                  />
                </aside>
              ) : null}
            </div>

            <figure className="home-hero-visual">
              <div className="home-hero-model">
                <Image
                  src="/images/bimspect/bimspect-model-overview.webp"
                  alt={content.images.heroAlt}
                  width={1672}
                  height={941}
                  sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 52vw, 720px"
                  priority
                />
              </div>
              <ModelAttribution className="home-hero-attribution" content={content.attribution} />
            </figure>
          </div>
        </section>

        <section className="home-problem" aria-labelledby="problem-title">
          <div className="wrap home-wrap home-problem-layout">
            <Reveal as="p" className="eyebrow">
              {content.problem.eyebrow}
            </Reveal>
            <Reveal delay={70}>
              <h2 id="problem-title">{content.problem.title}</h2>
              <p>{content.problem.description}</p>
            </Reveal>
            <Reveal as="p" className="home-problem-answer" delay={140}>
              {content.problem.conclusion}
            </Reveal>
          </div>
        </section>

        <section id="demo" className="home-demo" aria-labelledby="demo-title">
          <div className="wrap home-wrap home-demo-wrap">
            <Reveal className="home-demo-heading">
              <p className="eyebrow">{content.demo.eyebrow}</p>
              <h2 id="demo-title">{content.demo.title}</h2>
              <p id="demo-description">{content.demo.description}</p>
            </Reveal>
            <Reveal className="home-demo-reveal" delay={90}>
              <HomeDemoVideo content={content.demo.video} />
            </Reveal>
            <ModelAttribution className="home-demo-attribution" content={content.attribution} />
          </div>
        </section>

        <section className="home-feature home-feature-change" aria-labelledby="change-title">
          <div className="wrap home-wrap home-feature-grid">
            <div className="home-feature-copy">
              <Reveal as="p" className="eyebrow">
                {content.change.eyebrow}
              </Reveal>
              <Reveal as="h2" delay={70} id="change-title">
                {content.change.title}
              </Reveal>
              <Reveal as="p" delay={130}>
                {content.change.description}
              </Reveal>
              <Reveal className="home-change-labels" delay={190}>
                {content.change.labels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </Reveal>
            </div>
            <Reveal as="figure" className="home-product-image home-change-image" delay={100}>
              <Image
                src="/images/bimspect/bimspect-model-change-intensity.webp"
                alt={content.images.changeAlt}
                width={1672}
                height={941}
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 52vw, 680px"
              />
              <figcaption>{content.change.caption}</figcaption>
              <ModelAttribution content={content.attribution} />
            </Reveal>
          </div>
        </section>

        <section className="home-feature home-feature-focus" aria-labelledby="focus-title">
          <div className="wrap home-wrap home-feature-grid home-feature-grid-reverse">
            <Reveal as="figure" className="home-product-image home-focus-image" delay={80}>
              <Image
                src="/images/bimspect/bimspect-model-classifier.webp"
                alt={content.images.focusAlt}
                width={1672}
                height={941}
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 52vw, 680px"
              />
              <ModelAttribution content={content.attribution} />
            </Reveal>
            <div className="home-feature-copy">
              <Reveal as="p" className="eyebrow">
                {content.focus.eyebrow}
              </Reveal>
              <Reveal as="h2" delay={70} id="focus-title">
                {content.focus.title}
              </Reveal>
              <Reveal as="p" delay={130}>
                {content.focus.description}
              </Reveal>
              <Reveal as="ul" className="home-feature-list" delay={190}>
                {content.focus.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        <section className="home-feature home-feature-context" aria-labelledby="context-title">
          <div className="wrap home-wrap home-feature-grid">
            <div className="home-feature-copy">
              <Reveal as="p" className="eyebrow">
                {content.context.eyebrow}
              </Reveal>
              <Reveal as="h2" delay={70} id="context-title">
                {content.context.title}
              </Reveal>
              <Reveal as="p" delay={130}>
                {content.context.body}
              </Reveal>
            </div>
            <Reveal as="figure" className="home-product-image home-context-image" delay={100}>
              <Image
                src="/images/bimspect/bimspect-model-context.webp"
                alt={content.images.contextAlt}
                width={1536}
                height={1024}
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 52vw, 680px"
              />
              <ModelAttribution content={content.attribution} />
            </Reveal>
          </div>
        </section>

        <section id="workflow" className="home-workflow" aria-labelledby="workflow-title">
          <div className="wrap home-wrap">
            <div className="home-section-heading">
              <Reveal as="p" className="eyebrow">
                {content.workflow.eyebrow}
              </Reveal>
              <Reveal as="h2" delay={70} id="workflow-title">
                {content.workflow.title}
              </Reveal>
            </div>
            <Reveal className="home-workflow-steps" delay={80}>
              {content.workflow.steps.map((step, index) => (
                <Reveal
                  className="home-workflow-step"
                  delay={130 + index * 270}
                  key={step.number}
                >
                  <span className="home-workflow-number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </Reveal>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="analytics" className="home-analytics" aria-labelledby="analytics-title">
          <div className="wrap home-wrap home-analytics-grid">
            <div className="home-analytics-copy">
              <Reveal as="p" className="eyebrow">
                {content.analytics.eyebrow}
              </Reveal>
              <Reveal as="h2" delay={70} id="analytics-title">
                {content.analytics.title}
              </Reveal>
              <Reveal as="p" delay={130}>
                {content.analytics.body}
              </Reveal>
            </div>
            <Reveal as="figure" className="home-analytics-image" delay={100}>
              <Image
                src="/images/bimspect/bimspect-discipline-analytics-dashboard.png"
                alt={content.images.analyticsAlt}
                width={1352}
                height={728}
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1100px) 54vw, 720px"
              />
              <figcaption>{content.analytics.caption}</figcaption>
            </Reveal>
          </div>
        </section>

        <section id="sample-report" className="home-report" aria-labelledby="report-title">
          <div className="wrap home-wrap home-report-grid">
            <Reveal as="div" className="home-report-copy">
              <p className="eyebrow">{content.report.eyebrow}</p>
              <h2 id="report-title">{content.report.title}</h2>
              <p>{content.report.description}</p>
              {content.locale === "en" ? (
                <CampaignContactLink
                  className="btn btn-secondary"
                  interest="the BIMSpect sample report"
                  label={content.report.cta}
                />
              ) : (
                <a
                  className="btn btn-secondary"
                  href="mailto:hello@bimspect.com?subject=Request%20a%20BIMSpect%20sample%20report"
                >
                  {content.report.cta}
                </a>
              )}
            </Reveal>
            <Reveal as="figure" className="home-report-preview" delay={100}>
              <div className="home-report-topline">
                <span>{content.report.reportName}</span>
                <span>{content.report.sampleLabel}</span>
              </div>
              <div className="home-report-version">{content.report.versionLabel}</div>
              <div className="home-report-summary">
                <div>
                  <strong>51</strong>
                  <span>{content.report.totalChanges}</span>
                </div>
                <div>
                  <strong>+14</strong>
                  <span>{content.report.added}</span>
                </div>
                <div>
                  <strong>−6</strong>
                  <span>{content.report.deleted}</span>
                </div>
                <div>
                  <strong>~31</strong>
                  <span>{content.report.modified}</span>
                </div>
              </div>
              <div className="home-report-detail">
                <span>{content.report.intensityByDiscipline}</span>
                <div className="home-report-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <figcaption>{content.report.caption}</figcaption>
            </Reveal>
          </div>
        </section>

        <section id="security" className="home-trust" aria-labelledby="security-title">
          <div className="wrap home-wrap">
            <div className="home-section-heading home-trust-heading">
              <Reveal as="p" className="eyebrow">
                {content.trust.eyebrow}
              </Reveal>
              <Reveal as="h2" delay={70} id="security-title">
                {content.trust.title}
              </Reveal>
            </div>
            <div className="home-trust-points">
              {content.trust.points.map((point, index) => (
                <Reveal className="home-trust-point" delay={index * 60} key={point.label}>
                  <h3>{point.label}</h3>
                  <p>{point.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {content.locale === "fi" ? <CredibilitySections content={content} /> : null}

        {content.locale === "en" ? <PricingSection /> : null}

        <section id="contact" className="home-final-cta" aria-labelledby="contact-title">
          <div className="wrap home-wrap">
            <Reveal as="p" className="eyebrow">
              {content.contact.eyebrow}
            </Reveal>
            <Reveal as="h2" delay={70} id="contact-title">
              {content.contact.title}
            </Reveal>
            <Reveal as="p" delay={130}>
              {content.contact.description}
            </Reveal>
            {content.locale === "en" ? (
              <Reveal className="home-contact-form" delay={170}>
                <CampaignForm
                  kind="homepage-enquiry"
                  landingPage="homepage"
                  submitLabel="Talk to BIMSpect"
                  includeQuestion
                />
              </Reveal>
            ) : null}
            {content.locale === "fi" ? (
              <Reveal className="home-final-actions" delay={190}>
                <a className="btn btn-primary" href="mailto:hello@bimspect.com">
                  {content.contact.primaryCta}
                </a>
                <a className="btn btn-secondary" href="mailto:hello@bimspect.com">
                  {content.contact.secondaryCta}
                </a>
              </Reveal>
            ) : null}
          </div>
        </section>

        {content.locale === "en" ? <CredibilitySections content={content} /> : null}
      </main>
      <Footer
        variant="technical"
        links={content.footerLinks}
        useBrandImage
        accessibility={content.accessibility}
      />
    </>
  );
}
