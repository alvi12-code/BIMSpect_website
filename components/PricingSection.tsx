import {
  adoptionSteps,
  pricingComparison,
  pricingPlanAction,
  pricingPlans
} from "./data";
import { CampaignContactLink } from "./campaign/CampaignContactLink";
import { BuyNowLink } from "./payment/BuyNowLink";
import { Reveal } from "./Reveal";
import { StaggerContainer } from "./StaggerContainer";
import { applicationPurchaseEntry, marketingPurchaseAction } from "@/lib/payment/application-entry";
import { isCheckoutEnabled } from "@/lib/payment";
import { enquiryPlanForTier, planEnquiry } from "@/lib/enquiry-intent";
import { finnishPrice, finnishPricing } from "@/content/pricing";
import type { Locale } from "@/lib/locale";
import type { ReactNode } from "react";

type PricingSectionProps = {
  eyebrow?: string;
  heading?: string;
  copy?: string;
  showComparison?: boolean;
  showAdoptionPath?: boolean;
  afterPricingDisclosure?: ReactNode;
  contactLandingPage?: "homepage" | "pilot" | "what-changed";
  campaign?: string;
  locale?: Locale;
};

export function PricingSection({
  eyebrow: eyebrowProp,
  heading = "Start individually. Expand to a project. Scale across a portfolio.",
  copy: copyProp,
  showComparison = true,
  showAdoptionPath = true,
  afterPricingDisclosure,
  contactLandingPage = "homepage",
  campaign,
  locale = "en"
}: PricingSectionProps = {}) {
  // English renders components/data.ts as-is; Finnish swaps display copy only.
  const fi = locale === "fi" ? finnishPricing : null;
  const eyebrow = eyebrowProp ?? fi?.eyebrow ?? "Pricing & access";
  const copy = copyProp ?? fi?.copy ?? "Choose the access model that matches the way your organisation works with IFC model versions.";
  const actionLabel = (label: string) => fi?.actionLabels[label] ?? label;
  const applicationMode = process.env.PAYMENT_PROVIDER === "bimspect";
  const checkoutEnabled = isCheckoutEnabled() && (!applicationMode || Boolean(applicationPurchaseEntry(process.env, "individual")));

  return (
    <section id="pricing" className="section pricing-section">
      <div className="wrap">
        <div className="section-header pricing-header">
          <Reveal as="p" className="eyebrow">
            {eyebrow}
          </Reveal>
          <Reveal as="h2" delay={90}>
            {heading}
          </Reveal>
          <Reveal as="p" className="section-lead" delay={160}>
            {copy}
          </Reveal>
        </div>

        <StaggerContainer className="pricing-grid" delay={80}>
          {pricingPlans.map((plan) => {
            const action = marketingPurchaseAction(process.env, plan.tier) ?? pricingPlanAction(plan, checkoutEnabled);
            const enquiryPlan = enquiryPlanForTier(plan.tier);
            const planCopy = fi?.plans[plan.tier as keyof typeof fi.plans];
            const price = planCopy?.price ?? (fi ? finnishPrice(plan.price) : plan.price);
            const priceSuffix = plan.priceSuffix ? planCopy?.priceSuffix ?? plan.priceSuffix : null;
            const features = planCopy?.features ?? plan.features;

            return (
              <article
                className={["pricing-card", plan.featured ? "featured" : ""]
                  .filter(Boolean)
                  .join(" ")}
                key={plan.name}
              >
                {plan.featuredLabel ? (
                  <span className="pricing-featured-label">
                    {planCopy?.featuredLabel ?? plan.featuredLabel}
                  </span>
                ) : null}
                <div className="pricing-tier">{plan.tier}</div>
                <h3 className="pricing-name">{plan.name}</h3>
                <div
                  className={[
                    "pricing-price",
                    "pricing-price-main",
                    priceSuffix ? "" : "pricing-price-custom"
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {price}
                  {priceSuffix ? <span>{priceSuffix}</span> : null}
                </div>
                <p className="pricing-desc">{planCopy?.description ?? plan.description}</p>
                <div className="pricing-features">
                  {features.map((feature) => (
                    <div className="pricing-feature" key={feature.label}>
                      <span className="pricing-feature-icon" aria-hidden="true">
                        ✓
                      </span>
                      <span>
                        {feature.label}
                        {feature.note ? (
                          <span className="pricing-feature-note">
                            {feature.note}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
                {action.offerId ? (
                  <BuyNowLink
                    className={plan.featured ? "btn-inv" : "btn btn-secondary"}
                    href={action.href}
                    label={actionLabel(action.label)}
                    offerId={action.offerId}
                  />
                ) : action.href === "#contact" && enquiryPlan ? (
                  <CampaignContactLink
                    className={plan.featured ? "btn-inv" : "btn btn-secondary"}
                    intent={planEnquiry(enquiryPlan)}
                    label={actionLabel(action.label)}
                    landingPage={contactLandingPage}
                    campaign={campaign}
                  />
                ) : (
                  <a
                    className={plan.featured ? "btn-inv" : "btn btn-secondary"}
                    href={action.href}
                  >
                    {actionLabel(action.label)}
                  </a>
                )}
              </article>
            );
          })}
        </StaggerContainer>

        <p className="pricing-footnote">
          {fi ? fi.footnote : <>
          Prices are for business customers and exclude VAT and other applicable taxes.
          Taxes, if applicable, are determined based on the customer’s location and tax
          status. Project and Enterprise access are subject to an agreed scope,
          data-handling terms and technical feasibility.
          Customer-specific middleware, extensive data migration and non-standard
          custom development may be quoted separately.
          </>}
        </p>

        {afterPricingDisclosure}

        {showComparison ? (
          <Reveal className="pricing-comparison" delay={120}>
            {pricingComparison.map((column, columnIndex) => {
              const columnCopy = fi?.comparison[columnIndex];
              return (
              <div
                className={[
                  "comparison-column",
                  column.tone === "negative"
                    ? "comparison-negative"
                    : "comparison-positive"
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={column.title}
              >
                <h3>{columnCopy?.title ?? column.title}</h3>
                <div className="comparison-list">
                  {(columnCopy?.items ?? column.items).map((item) => (
                    <div className="comparison-item" key={item}>
                      <span className="comparison-icon" aria-hidden="true">
                        {column.tone === "negative" ? "✕" : "✓"}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {column.cta ? (
                  column.href === "#contact" ? (
                    <CampaignContactLink
                      className="btn btn-primary"
                      interest={fi?.comparisonInterest ?? "Project analysis"}
                      label={columnCopy?.cta ?? column.cta}
                      landingPage={contactLandingPage}
                      campaign={campaign}
                    />
                  ) : (
                    <a className="btn btn-primary" href={column.href}>
                      {columnCopy?.cta ?? column.cta}
                    </a>
                  )
                ) : null}
              </div>
              );
            })}
          </Reveal>
        ) : null}

        {showAdoptionPath ? (
          <div className="adoption-path">
            <Reveal className="adoption-card">
              {fi ? <>
                <p className="eyebrow">{fi.adoption.eyebrow}</p>
                <h3>{fi.adoption.title}</h3>
                <p>{fi.adoption.body}</p>
              </> : <>
              <p className="eyebrow">Adoption path</p>
              <h3>Start individually. Scale when the project needs a shared view.</h3>
              <p>
                BIMSpect can begin with an individual BIM coordinator and expand
                into a shared project or portfolio-level workflow when the value
                becomes clear.
              </p>
              </>}
            </Reveal>

            <StaggerContainer className="growth-steps" stagger={70}>
              {adoptionSteps.map((step, stepIndex) => (
                <div className="growth-step" key={step.number}>
                  <div className="growth-step-num">{step.number}</div>
                  <strong>{fi?.adoptionSteps[stepIndex]?.title ?? step.title}</strong>
                  <span>{fi?.adoptionSteps[stepIndex]?.body ?? step.body}</span>
                </div>
              ))}
            </StaggerContainer>
          </div>
        ) : null}
      </div>
    </section>
  );
}
