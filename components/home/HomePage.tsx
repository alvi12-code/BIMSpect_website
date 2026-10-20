import Image from "next/image";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HomeDemoVideo } from "@/components/HomeDemoVideo";
import { LanguageSuggestion } from "@/components/LanguageSuggestion";
import { DesignStoryHero } from "@/components/design-story/DesignStoryHero";
import { DesignContextEvidence } from "@/components/design-story/DesignContextEvidence";
import { DesignReportPreview } from "@/components/design-story/DesignReportPreview";
import { ModelAttribution } from "@/components/ModelAttribution";
import { PricingSection } from "@/components/PricingSection";
import { Reveal } from "@/components/Reveal";
import { CampaignContactLink } from "@/components/campaign/CampaignContactLink";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import type { HomeContent } from "@/content/home";
import { SAMPLE_REPORT_REQUEST } from "@/lib/enquiry-intent";

type HomePageProps = {
  content: HomeContent;
  languageHref: string;
  shouldSuggestFinnish?: boolean;
};

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
      <main id="main-content" className="homepage homepage-story">
        <section id="home" className="design-story-section" aria-labelledby="home-hero-title">
          <DesignStoryHero content={content} />
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
            </div>
            <Reveal as="figure" className="home-product-image home-change-image" delay={80}>
              <Image src="/images/bimspect/bimspect-model-change-intensity.webp" alt={content.images.changeAlt}
                width={1672} height={941} sizes="(max-width: 800px) 90vw, 50vw" />
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

        <section className="home-feature home-feature-context" aria-labelledby="context-title" data-discipline-section="plumbing">
          <div className="wrap home-wrap home-feature-grid home-feature-grid-reverse">
            <div className="home-model-visual">
              <DesignContextEvidence locale={content.locale} />
            </div>
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
                  delay={90 + index * 70}
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
              <CampaignContactLink
                className="btn btn-secondary"
                intent={SAMPLE_REPORT_REQUEST}
                label={content.report.cta}
              />
            </Reveal>
            <Reveal delay={100}><DesignReportPreview locale={content.locale} /></Reveal>
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

        <PricingSection heading={content.pricingHeading} locale={content.locale} />

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
            <Reveal className="home-contact-form" delay={170}>
              <CampaignForm
                kind="homepage-enquiry"
                landingPage="homepage"
                submitLabel={content.contact.submitLabel}
                includeQuestion
                locale={content.locale}
              />
            </Reveal>
          </div>
        </section>

        <CredibilitySections content={content} />
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
