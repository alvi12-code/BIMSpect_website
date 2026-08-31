import type { Metadata } from "next";
import {
  CampaignHero,
  CampaignShell,
  SectionHeading
} from "@/components/campaign/CampaignLayout";
import {
  CampaignImageFrame,
  CampaignVideo
} from "@/components/campaign/CampaignMedia";
import {
  CampaignBenefits,
  LeadSection,
  ProductShowcase
} from "@/components/campaign/CampaignSections";
import {
  campaignMedia,
  pilotBenefits,
  pilotNavigation
} from "@/components/campaign/content";
import styles from "@/components/campaign/campaign.module.css";

export const metadata: Metadata = {
  title: "BIMSpect Pilot | Continue the conversation",
  description:
    "For BIMSpect pilot organisations: continue the conversation as BIMSpect moves from Aalto University’s Research to Business (R2B) development phase to commercial operations.",
  alternates: {
    canonical: "/pilot"
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: "BIMSpect Pilot | Continue the conversation",
    description:
      "For BIMSpect pilot organisations: continue the conversation as BIMSpect moves from Aalto University’s Research to Business development phase to commercial operations.",
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
    title: "BIMSpect Pilot | Continue the conversation",
    description:
      "For BIMSpect pilot organisations: continue the conversation as BIMSpect moves from Aalto University’s Research to Business development phase to commercial operations.",
    images: ["/brand/bimspect-og-image.jpg"]
  }
};

export default function PilotPage() {
  return (
    <CampaignShell
      landingPage="pilot"
      navigation={pilotNavigation}
      navigationCta={{ href: "#contact", label: "Talk to us" }}
    >
      <CampaignHero
        className={styles.pilotHero}
        eyebrow="BIMSPECT PILOT"
        heading={
          <>
            BIMSpect is entering its <em>next chapter.</em>
            <span className={styles.heroThankYou}>
              Thank you for being part of our pilot journey.
            </span>
          </>
        }
        supportingCopy={[
          "BIMSpect is moving from Aalto University’s Research to Business (R2B) development phase to commercial operations. We want to continue the conversation with the organizations and people who helped shape the product."
        ]}
        ctas={[
          { href: "#contact", label: "Talk to us", primary: true },
          { href: "#analytics", label: "See what’s new in BIMSpect" }
        ]}
        browserStatement={
          <>
            <strong>Browser-based.</strong> No installation required.
          </>
        }
      />

      <section id="analytics" className={styles.section}>
        <div className="wrap">
          <ProductShowcase
            eyebrow="Design intelligence"
            heading="From model changes to design insight"
            copy="BIMSpect turns model-version changes into clear indicators and visual summaries for design review."
            image={campaignMedia.analytics}
            imageLabel="BIMSpect · design analytics"
            annotations={[
              "Design completion",
              "Design confidence",
              "Stability",
              "Rework pressure",
              "Review priorities"
            ]}
          />
        </div>
      </section>

      <section id="demo" className={styles.section}>
        <div className="wrap">
          <SectionHeading
            eyebrow="Design-change demo"
            heading="Review colour-coded design changes in 3D."
            copy="See the BIMSpect model viewer focus the review with colour-coded changes and change-type filters."
          />
          <CampaignVideo
            landingPage="pilot"
            label="BIMSpect 3D design-change review"
            caption="Colour-coded model changes and change-type filters in the BIMSpect viewer."
          />
        </div>
      </section>

      <section id="capabilities" className={styles.sectionAlt}>
        <div className="wrap">
          <CampaignBenefits benefits={pilotBenefits} />
        </div>
      </section>

      <LeadSection
        id="contact"
        eyebrow="Talk to BIMSpect"
        heading="Let’s discuss continuing with BIMSpect"
        copy="Tell us about your project or how you would like to continue using BIMSpect. We’ll follow up personally."
        kind="pilot-enquiry"
        landingPage="pilot"
        submitLabel="Talk to BIMSpect"
        includeQuestion
        aside={
          <CampaignImageFrame
            {...campaignMedia.viewer}
            label="BIMSpect · model-change evidence"
            caption="Visual change context in BIMSpect"
          />
        }
      />
    </CampaignShell>
  );
}
