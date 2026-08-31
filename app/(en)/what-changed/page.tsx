import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import {
  CampaignHero,
  CampaignShell,
  FinalCta,
  SectionHeading
} from "@/components/campaign/CampaignLayout";
import {
  CampaignImageFrame,
  CampaignVideo
} from "@/components/campaign/CampaignMedia";
import {
  CampaignWorkflow,
  LeadSection,
  PricingBridge,
  ProductShowcase,
  ReportPlaceholder
} from "@/components/campaign/CampaignSections";
import {
  campaignBusinessConfig,
  campaignMedia,
  changeAnnotations,
  changeWorkflow,
  whatChangedNavigation
} from "@/components/campaign/content";
import styles from "@/components/campaign/campaign.module.css";

export const metadata: Metadata = {
  title: "What Changed? | BIM Model Change Analysis | BIMSpect",
  description:
    "BIMSpect helps teams understand changes between BIM model versions directly in the browser.",
  alternates: {
    canonical: "/what-changed"
  },
  openGraph: {
    title: "What Changed? | BIM Model Change Analysis | BIMSpect",
    description:
      "BIMSpect helps teams understand changes between BIM model versions directly in the browser.",
    url: "/what-changed",
    siteName: "BIMSpect",
    type: "website",
    images: [
      {
        url: "/brand/bimspect-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BIMSpect viewer showing a colour-coded IFC model change visualization"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "What Changed? | BIM Model Change Analysis | BIMSpect",
    description:
      "BIMSpect helps teams understand changes between BIM model versions directly in the browser.",
    images: ["/brand/bimspect-og-image.jpg"]
  }
};

export default function WhatChangedPage() {
  return (
    <CampaignShell
      landingPage="what-changed"
      navigation={whatChangedNavigation}
      navigationCta={{ href: "#sample-report", label: "Get sample report" }}
    >
      <CampaignHero
        eyebrow="BIM Change Intelligence"
        heading={
          <>
            What <em>changed?</em>
          </>
        }
        supportingCopy={[
          "BIM models evolve. Understanding exactly what changed shouldn’t take hours.",
          "BIMSpect helps teams review changes between BIM model versions directly in the browser."
        ]}
        ctas={[
          { href: "#sample-report", label: "Get a sample report", primary: true },
          { href: "#workflow", label: "See how it works" },
          { href: "#pricing", label: "View pricing" }
        ]}
        visual={
          <CampaignVideo
            landingPage="what-changed"
            label="BIMSpect 3D design-change review"
            caption="Colour-coded model changes and change-type filters in the BIMSpect viewer."
          />
        }
      />

      <section id="problem" className={styles.section}>
        <div className="wrap">
          <SectionHeading
            eyebrow="The coordination problem"
            heading="BIM models change constantly."
            copy="When new model versions arrive, understanding what has actually changed can require significant manual review and coordination."
          />
          <Reveal className={styles.problemFlow} delay={100}>
            <div className={styles.problemCard}>
              <span>Model version A</span>
              <strong>Earlier issue</strong>
              <i aria-hidden="true" />
            </div>
            <div className={styles.flowArrow} aria-hidden="true">
              →
            </div>
            <div className={styles.problemCard}>
              <span>Model version B</span>
              <strong>New issue</strong>
              <i aria-hidden="true" />
            </div>
            <div className={styles.flowArrow} aria-hidden="true">
              →
            </div>
            <div className={styles.problemQuestion}>
              <span>Coordination question</span>
              <strong>What actually changed?</strong>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="solution" className={styles.sectionAlt}>
        <div className="wrap">
          <div className={styles.solutionIntro}>
            <Reveal>
              <p className={styles.solutionBrand}>BIMSpect</p>
              <h2>See the changes that matter between model versions.</h2>
            </Reveal>
            <Reveal as="p" delay={100}>
              Move from two separate model files to a clear visual view of the
              differences between them.
            </Reveal>
          </div>
          <Reveal className={styles.versionRail} delay={140}>
            <span className={styles.versionNode}>Model version A</span>
            <span className={styles.versionArrow} aria-hidden="true">
              →
            </span>
            <span className={styles.versionNode}>Model version B</span>
            <span className={styles.versionArrow} aria-hidden="true">
              →
            </span>
            <span className={styles.versionNode}>BIMSpect comparison</span>
          </Reveal>
          <Reveal delay={180}>
            <CampaignImageFrame
              {...campaignMedia.viewer}
              label="BIMSpect Viewer · change visualisation"
              caption="Real BIMSpect Viewer with colour-coded change context"
            />
          </Reveal>
        </div>
      </section>

      <section id="workflow" className={styles.section}>
        <div className="wrap">
          <SectionHeading
            eyebrow="How it works"
            heading="From model versions to a focused review."
            copy="A direct, browser-based workflow for understanding model changes."
          />
          <CampaignWorkflow steps={changeWorkflow} />
        </div>
      </section>

      <section id="product" className={styles.sectionAlt}>
        <div className="wrap">
          <ProductShowcase
            heading="See changes, not just models."
            copy="Use the visual comparison and version context to focus on the differences that need review."
            image={campaignMedia.analytics}
            imageLabel="BIMSpect · model-version analytics"
            annotations={[
              ...changeAnnotations,
              "Version context",
              "Review priorities"
            ]}
          />
          <div className={styles.dashboardStrip}>
            <p>
              BIMSpect connects visual model-change information with a structured
              view for coordination and design review.
            </p>
          </div>
        </div>
      </section>

      <LeadSection
        id="sample-report"
        eyebrow="Sample analysis"
        heading="See what a BIMSpect analysis looks like."
        copy="Request a sample BIM change report and see how BIMSpect communicates differences between model versions."
        kind="sample-report"
        landingPage="what-changed"
        submitLabel="Send me the sample report"
        aside={<ReportPlaceholder />}
      />

      <PricingBridge
        heading="Ready to use BIMSpect on your project?"
        copy="Explore BIMSpect options for individuals, projects and organisations."
      />

      <FinalCta
        heading="Ready to see what changed?"
        actions={[
          { href: "#sample-report", label: "Get sample report", primary: true },
          { href: "#pricing", label: "View pricing" },
          {
            href: `mailto:${campaignBusinessConfig.contactEmail}`,
            label: "Talk to BIMSpect"
          }
        ]}
      />
    </CampaignShell>
  );
}
