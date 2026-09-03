import type { Metadata } from "next";
import Image from "next/image";
import { HomeDemoVideo } from "@/components/HomeDemoVideo";
import { ModelAttribution } from "@/components/ModelAttribution";
import { PricingSection } from "@/components/PricingSection";
import {
  CampaignHero,
  CampaignShell,
  SectionHeading
} from "@/components/campaign/CampaignLayout";
import {
  CampaignBenefits,
  CampaignWorkflow,
  LeadSection
} from "@/components/campaign/CampaignSections";
import {
  pilotCommercialCampaign,
  pilotNavigation,
  pilotTrustBenefits,
  pilotWorkflow
} from "@/components/campaign/content";
import styles from "@/components/campaign/campaign.module.css";
import { homeContent } from "@/content/home";

export const metadata: Metadata = {
  title: "BIMSpect Pilot | Early customer offer",
  description:
    "For BIMSpect pilot organisations: continue using BIMSpect in real project work under early-customer terms.",
  alternates: {
    canonical: "/pilot"
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "BIMSpect Pilot | Early customer offer",
    description:
      "For BIMSpect pilot organisations: continue using BIMSpect in real project work under early-customer terms.",
    url: "/pilot",
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
    title: "BIMSpect Pilot | Early customer offer",
    description:
      "For BIMSpect pilot organisations: continue using BIMSpect in real project work under early-customer terms.",
    images: ["/brand/bimspect-og-image.jpg"]
  }
};

export default function PilotPage() {
  return (
    <CampaignShell
      landingPage="pilot"
      campaign={pilotCommercialCampaign}
      navigation={pilotNavigation}
      navigationCta={{ href: "#pricing", label: "View pricing" }}
      >
      <CampaignHero
        className={styles.pilotHero}
        eyebrow="Early customer offer for pilot companies"
        heading={
          <>
            Continue with BIMSpect in <em>real project work.</em>
          </>
        }
        supportingCopy={[
          "BIMSpect Oy is now operational. We are inviting selected pilot companies to continue using BIMSpect under early-customer terms.",
          "Analyse IFC model version history over time, visualise design activity through Design Buzz, and turn technical model changes into understandable reports for BIM coordination and design management."
        ]}
        ctas={[
          { href: "#pricing", label: "View pricing", primary: true },
          { href: "#walkthrough", label: "Watch product walkthrough" }
        ]}
        browserStatement={
          <>
            <strong>Browser-based</strong>
            <span>
              · No installation · IFC2x3 / IFC4 · EU-based processing · No AI training
              on client files
            </span>
          </>
        }
        visual={
          <figure className="home-hero-visual">
            <div className="home-hero-model">
              <Image
                src="/images/bimspect/bimspect-model-overview.webp"
                alt={homeContent.en.images.heroAlt}
                width={1672}
                height={941}
                sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1100px) 52vw, 620px"
                priority
              />
            </div>
            <ModelAttribution
              className="home-hero-attribution"
              content={homeContent.en.attribution}
            />
          </figure>
        }
      />

      <PricingSection
        eyebrow="Choose how you want to continue"
        heading="Straightforward access for individual, project and enterprise use."
        copy="Public pricing is shown here. Choose the option that best fits the way you work."
        showComparison={false}
        showAdoptionPath={false}
        contactLandingPage="pilot"
        campaign={pilotCommercialCampaign}
        afterPricingDisclosure={
          <aside className={styles.pilotTerms} aria-labelledby="pilot-terms-title">
            <p className="eyebrow">Early-customer terms</p>
            <h3 id="pilot-terms-title">Pilot organisations can continue with confidence.</h3>
            <p>
              Pilot organisations may be eligible for early-customer terms. Contact us
              if you would like to discuss the applicable arrangement.
            </p>
          </aside>
        }
      />

      <section id="product" className={styles.sectionAlt}>
        <div className="wrap">
          <SectionHeading
            eyebrow="Design intelligence"
            heading="See where the design is moving."
            copy="Follow IFC model version history, locate change concentration with Design Buzz, and bring clear evidence to coordination and design-management reviews."
          />
          <div className={styles.pilotProofGrid}>
            <figure className={`home-product-image ${styles.pilotProofPrimary}`}>
              <Image
                src="/images/bimspect/bimspect-model-change-intensity.webp"
                alt={homeContent.en.images.changeAlt}
                width={1672}
                height={941}
                sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1100px) 58vw, 700px"
              />
              <figcaption>{homeContent.en.change.caption}</figcaption>
            </figure>
            <div className={styles.pilotProofStack}>
              <figure className="home-product-image">
                <Image
                  src="/images/bimspect/bimspect-model-classifier.webp"
                  alt={homeContent.en.images.focusAlt}
                  width={1672}
                  height={941}
                  sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1100px) 42vw, 460px"
                />
                <figcaption>{homeContent.en.focus.title}</figcaption>
              </figure>
              <figure className="home-analytics-image">
                <Image
                  src="/images/bimspect/bimspect-discipline-analytics-dashboard.png"
                  alt={homeContent.en.images.analyticsAlt}
                  width={1352}
                  height={728}
                  sizes="(max-width: 768px) calc(100vw - 40px), (max-width: 1100px) 42vw, 460px"
                />
                <figcaption>{homeContent.en.analytics.caption}</figcaption>
              </figure>
            </div>
            <ModelAttribution
              className={styles.pilotProofAttribution}
              content={homeContent.en.attribution}
            />
          </div>
        </div>
      </section>

      <section id="walkthrough" className={styles.section}>
        <div className="wrap">
          <SectionHeading
            eyebrow="Product walkthrough"
            heading="Review design activity in the model context."
            copy="Use the colour-coded change view and filters to focus attention on the areas that need review."
          />
          <HomeDemoVideo
            content={homeContent.en.demo.video}
            landingPage="pilot"
            campaign={pilotCommercialCampaign}
            ariaDescribedBy="pilot-walkthrough-description"
          />
          <p id="pilot-walkthrough-description" className={styles.visuallyHidden}>
            {homeContent.en.demo.description}
          </p>
          <ModelAttribution
            className="home-demo-attribution"
            content={homeContent.en.attribution}
          />
        </div>
      </section>

      <section id="how-it-works" className={styles.sectionAlt}>
        <div className="wrap">
          <SectionHeading
            eyebrow="How BIMSpect works"
            heading="A focused workflow for IFC change review."
            copy="Upload releases, review the activity that matters, and share the findings."
          />
          <CampaignWorkflow steps={pilotWorkflow} />
        </div>
      </section>

      <section id="data-handling" className={styles.section}>
        <div className="wrap">
          <SectionHeading
            eyebrow="Data handling"
            heading="Project data deserves serious handling."
            copy="The practical information teams need before sharing IFC model files."
          />
          <CampaignBenefits benefits={pilotTrustBenefits} />
        </div>
      </section>

      <LeadSection
        id="contact"
        eyebrow="Talk with BIMSpect"
        heading="Questions about the right setup?"
        copy="Ask about the plans, early-customer terms, or the best way to use BIMSpect in your project."
        kind="pilot-enquiry"
        landingPage="pilot"
        campaign={pilotCommercialCampaign}
        submitLabel="Talk with BIMSpect"
        includeQuestion
      />
    </CampaignShell>
  );
}
