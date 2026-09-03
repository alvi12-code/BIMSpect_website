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
import { isCheckoutEnabled } from "@/lib/payment";
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
};

export function PricingSection({
  eyebrow = "Pricing & access",
  heading = "Start individually. Expand to a project. Scale across a portfolio.",
  copy = "Choose the access model that matches the way your organisation works with IFC model versions.",
  showComparison = true,
  showAdoptionPath = true,
  afterPricingDisclosure,
  contactLandingPage = "homepage",
  campaign
}: PricingSectionProps = {}) {
  const checkoutEnabled = isCheckoutEnabled();

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
            const action = pricingPlanAction(plan, checkoutEnabled);

            return (
              <article
                className={["pricing-card", plan.featured ? "featured" : ""]
                  .filter(Boolean)
                  .join(" ")}
                key={plan.name}
              >
                {plan.featuredLabel ? (
                  <span className="pricing-featured-label">
                    {plan.featuredLabel}
                  </span>
                ) : null}
                <div className="pricing-tier">{plan.tier}</div>
                <h3 className="pricing-name">{plan.name}</h3>
                <div
                  className={[
                    "pricing-price",
                    "pricing-price-main",
                    plan.priceSuffix ? "" : "pricing-price-custom"
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {plan.price}
                  {plan.priceSuffix ? <span>{plan.priceSuffix}</span> : null}
                </div>
                <p className="pricing-desc">{plan.description}</p>
                <div className="pricing-features">
                  {plan.features.map((feature) => (
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
                    label={action.label}
                    offerId={action.offerId}
                  />
                ) : action.href === "#contact" ? (
                  <CampaignContactLink
                    className={plan.featured ? "btn-inv" : "btn btn-secondary"}
                    interest={plan.name}
                    label={action.label}
                    landingPage={contactLandingPage}
                    campaign={campaign}
                  />
                ) : (
                  <a
                    className={plan.featured ? "btn-inv" : "btn btn-secondary"}
                    href={action.href}
                  >
                    {action.label}
                  </a>
                )}
              </article>
            );
          })}
        </StaggerContainer>

        <p className="pricing-footnote">
          Prices are for business customers and exclude VAT and other applicable taxes.
          Taxes, if applicable, are determined based on the customer’s location and tax
          status. Project and Enterprise access are subject to an agreed scope,
          data-handling terms and technical feasibility.
          Customer-specific middleware, extensive data migration and non-standard
          custom development may be quoted separately.
        </p>

        {afterPricingDisclosure}

        {showComparison ? (
          <Reveal className="pricing-comparison" delay={120}>
            {pricingComparison.map((column) => (
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
                <h3>{column.title}</h3>
                <div className="comparison-list">
                  {column.items.map((item) => (
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
                      interest="Project analysis"
                      label={column.cta}
                      landingPage={contactLandingPage}
                      campaign={campaign}
                    />
                  ) : (
                    <a className="btn btn-primary" href={column.href}>
                      {column.cta}
                    </a>
                  )
                ) : null}
              </div>
            ))}
          </Reveal>
        ) : null}

        {showAdoptionPath ? (
          <div className="adoption-path">
            <Reveal className="adoption-card">
              <p className="eyebrow">Adoption path</p>
              <h3>Start individually. Scale when the project needs a shared view.</h3>
              <p>
                BIMSpect can begin with an individual BIM coordinator and expand
                into a shared project or portfolio-level workflow when the value
                becomes clear.
              </p>
            </Reveal>

            <StaggerContainer className="growth-steps" stagger={70}>
              {adoptionSteps.map((step) => (
                <div className="growth-step" key={step.number}>
                  <div className="growth-step-num">{step.number}</div>
                  <strong>{step.title}</strong>
                  <span>{step.body}</span>
                </div>
              ))}
            </StaggerContainer>
          </div>
        ) : null}
      </div>
    </section>
  );
}
