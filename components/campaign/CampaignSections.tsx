import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { StaggerContainer } from "@/components/StaggerContainer";
import { CampaignForm } from "./CampaignForm";
import { CampaignImageFrame } from "./CampaignMedia";
import { SectionHeading } from "./CampaignLayout";
import {
  campaignBusinessConfig,
  pilotPricing,
  type PilotBenefit
} from "./content";
import styles from "./campaign.module.css";

type CampaignIconName = "browser" | "compare" | "collaborate";

function CampaignIcon({ name }: { name: CampaignIconName }) {
  if (name === "browser") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.75" y="4" width="18.5" height="16" rx="2" />
        <path d="M3 8h18M6.5 6h.01M9 6h.01" />
      </svg>
    );
  }

  if (name === "compare") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5 4 9l4 4M4 9h13M16 19l4-4-4-4M20 15H7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2.8 19c.6-3 2.4-4.8 5.2-4.8s4.7 1.8 5.2 4.8M14 14.7c.8-.7 1.7-1 2.9-1 2.4 0 3.8 1.5 4.3 4" />
    </svg>
  );
}

export function CampaignBenefits({ benefits }: { benefits: PilotBenefit[] }) {
  return (
    <StaggerContainer className={styles.benefitGrid} stagger={80}>
      {benefits.map((benefit) => (
        <article className={styles.benefitCard} key={benefit.title}>
          <div className={styles.benefitIcon}>
            <CampaignIcon name={benefit.icon} />
          </div>
          <h3>{benefit.title}</h3>
          <p>{benefit.description}</p>
        </article>
      ))}
    </StaggerContainer>
  );
}

type WorkflowStep = {
  number: string;
  title: string;
  description: string;
};

export function CampaignWorkflow({ steps }: { steps: WorkflowStep[] }) {
  return (
    <StaggerContainer
      className={[styles.workflow, steps.length === 4 ? styles.workflowFour : ""]
        .filter(Boolean)
        .join(" ")}
      stagger={90}
    >
      {steps.map((step, index) => (
        <article className={styles.workflowStep} key={step.number}>
          <div className={styles.workflowNumber}>{step.number}</div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
          {index < steps.length - 1 ? (
            <span className={styles.workflowArrow} aria-hidden="true">
              →
            </span>
          ) : null}
        </article>
      ))}
    </StaggerContainer>
  );
}

type ProductShowcaseProps = {
  eyebrow?: string;
  heading: string;
  copy: string;
  image: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  imageLabel: string;
  annotations: string[];
  extraMedia?: ReactNode;
};

export function ProductShowcase({
  eyebrow = "BIMSpect product",
  heading,
  copy,
  image,
  imageLabel,
  annotations,
  extraMedia
}: ProductShowcaseProps) {
  return (
    <div className={styles.productShowcase}>
      <div className={styles.productCopy}>
        <SectionHeading eyebrow={eyebrow} heading={heading} copy={copy} />
        <StaggerContainer className={styles.annotationList} stagger={60}>
          {annotations.map((annotation) => (
            <div className={styles.annotation} key={annotation}>
              <span aria-hidden="true" />
              {annotation}
            </div>
          ))}
        </StaggerContainer>
      </div>
      <Reveal className={styles.productMedia} delay={100}>
        <CampaignImageFrame
          {...image}
          label={imageLabel}
          caption="Real BIMSpect product view"
        />
      </Reveal>
      {extraMedia ? <Reveal className={styles.extraMedia}>{extraMedia}</Reveal> : null}
    </div>
  );
}

export function CommercialContinuation() {
  return (
    <section id="continue" className={styles.continuationSection}>
      <div className={`wrap ${styles.continuationGrid}`}>
        <SectionHeading
          eyebrow="The next phase"
          heading="Continue with BIMSpect"
          copy="As BIMSpect moves into commercial operations, we’re discussing the next phase individually with our pilot organizations."
        />
        <Reveal className={styles.continuationCard} delay={100}>
          <p>Existing pilot organizations can talk with BIMSpect about:</p>
          <ul>
            <li>continuing to use BIMSpect</li>
            <li>current or upcoming projects</li>
            <li>requirements</li>
            <li>the most suitable commercial setup</li>
          </ul>
          <a className="btn btn-primary" href="#contact">
            Discuss continuing with BIMSpect
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function ReportPreview() {
  return (
    <div className={styles.reportPreview} aria-label="Sample report preview">
      <div className={styles.reportTopline}>
        <span>BIMSpect</span>
        <span>Sample change report</span>
      </div>
      <div className={styles.reportBody}>
        <p className="eyebrow">BIM model version comparison</p>
        <h3>BIMSpect Sample Change Report</h3>
        <div className={styles.reportDivider} />
        <ul>
          <li>Comparison scope</li>
          <li>Change overview</li>
          <li>Review context</li>
          <li>Coordination notes</li>
        </ul>
      </div>
      {campaignBusinessConfig.sampleReportAssetHref ? (
        <a
          className={styles.reportAssetLink}
          href={campaignBusinessConfig.sampleReportAssetHref}
        >
          View approved sample report
        </a>
      ) : (
        <p className={styles.reportNote}>
          A structured view of differences between BIM model versions.
        </p>
      )}
    </div>
  );
}

type LeadSectionProps = {
  id: string;
  eyebrow: string;
  heading: string;
  copy: string;
  kind: "pilot-enquiry" | "sample-report";
  landingPage: "pilot" | "what-changed";
  submitLabel: string;
  includeQuestion?: boolean;
  aside?: ReactNode;
  campaign?: string;
};

export function LeadSection({
  id,
  eyebrow,
  heading,
  copy,
  kind,
  landingPage,
  submitLabel,
  includeQuestion = false,
  aside,
  campaign
}: LeadSectionProps) {
  return (
    <section id={id} className={styles.leadSection}>
      <div
        className={`wrap ${[styles.leadGrid, aside ? "" : styles.leadGridSingle]
          .filter(Boolean)
          .join(" ")}`}
      >
        <div>
          <SectionHeading eyebrow={eyebrow} heading={heading} copy={copy} />
          <Reveal delay={100}>
            <CampaignForm
              kind={kind}
              landingPage={landingPage}
              submitLabel={submitLabel}
              includeQuestion={includeQuestion}
              campaign={campaign}
            />
          </Reveal>
        </div>
        {aside ? <Reveal className={styles.leadAside}>{aside}</Reveal> : null}
      </div>
    </section>
  );
}

type PricingBridgeProps = {
  heading: string;
  copy: string;
};

function CampaignPrice({ availability }: { availability: string }) {
  const [amount, period] = availability.split(" / ");

  return (
    <strong className={styles.pricingPrice}>
      <span className={styles.pricingPriceAmount}>{amount}</span>
      {period ? <span className={styles.pricingPricePeriod}>/ {period}</span> : null}
    </strong>
  );
}

export function PricingBridge({ heading, copy }: PricingBridgeProps) {
  return (
    <section id="pricing" className={styles.pricingBridge}>
      <div className="wrap">
        <div className={styles.pricingBridgeInner}>
          <div>
            <Reveal as="p" className="eyebrow">
              Pricing
            </Reveal>
            <Reveal as="h2" delay={80}>
              {heading}
            </Reveal>
            <Reveal as="p" delay={140}>
              {copy}
            </Reveal>
          </div>
        </div>
        <StaggerContainer className={styles.pricingGrid} stagger={80}>
          {pilotPricing.map((plan) => (
            <article
              className={[
                styles.pricingCard,
                plan.featured ? styles.pricingFeatured : ""
              ]
                .filter(Boolean)
                .join(" ")}
              key={plan.name}
            >
              <p className={styles.pricingLabel}>{plan.tier}</p>
              <h3>{plan.name}</h3>
              <p>{plan.audience}</p>
              <CampaignPrice availability={plan.availability} />
              <a
                className={plan.featured ? "btn-inv" : "btn btn-secondary"}
                href="#sample-report"
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
