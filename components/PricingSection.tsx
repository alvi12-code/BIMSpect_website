import { adoptionSteps, pricingComparison, pricingPlans } from "./data";
import { Reveal } from "./Reveal";
import { StaggerContainer } from "./StaggerContainer";

export function PricingSection() {
  return (
    <section id="pricing" className="section pricing-section">
      <div className="wrap">
        <div className="section-header pricing-header">
          <Reveal as="p" className="eyebrow">
            Pricing &amp; access
          </Reveal>
          <Reveal as="h2" delay={90}>
            Start individually. Expand to a project. Scale across a portfolio.
          </Reveal>
          <Reveal as="p" className="section-lead" delay={160}>
            Choose the access model that matches the way your organisation works
            with IFC model versions.
          </Reveal>
        </div>

        <Reveal
          className="pricing-comparison"
          delay={120}
        >
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
                <a className="btn btn-primary" href={column.href}>
                  {column.cta}
                </a>
              ) : null}
            </div>
          ))}
        </Reveal>

        <StaggerContainer className="pricing-grid" delay={80}>
          {pricingPlans.map((plan) => (
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
              <a className={plan.featured ? "btn-inv" : "btn btn-secondary"} href={plan.href}>
                {plan.cta}
              </a>
            </article>
          ))}
        </StaggerContainer>

        <p className="pricing-footnote">
          Prices exclude VAT. Project and Enterprise access are subject to an
          agreed scope, data-handling terms and technical feasibility.
          Customer-specific middleware, extensive data migration and non-standard
          custom development may be quoted separately.
        </p>

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

          <StaggerContainer
            className="growth-steps"
            stagger={70}
          >
            {adoptionSteps.map((step) => (
              <div className="growth-step" key={step.number}>
                <div className="growth-step-num">{step.number}</div>
                <strong>{step.title}</strong>
                <span>{step.body}</span>
              </div>
            ))}
          </StaggerContainer>
        </div>

        <Reveal className="access-form" delay={120}>
          <p className="eyebrow access-eyebrow">Request access</p>
          <h3>Tell us about your organisation and intended use</h3>
          <div className="access-form-grid">
            <div className="form-field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" />
            </div>
            <div className="form-field">
              <label htmlFor="email">Work email</label>
              <input id="email" type="email" />
            </div>
            <div className="form-field">
              <label htmlFor="organisation">Organisation</label>
              <input id="organisation" type="text" />
            </div>
            <div className="form-field">
              <label htmlFor="access-model">Access model</label>
              <select id="access-model" defaultValue="BIMSpect Project">
                <option>BIMSpect Individual</option>
                <option>BIMSpect Project</option>
                <option>BIMSpect Enterprise</option>
              </select>
            </div>
          </div>
          <div className="form-field form-field-full">
            <label htmlFor="analysis-context">What would you like to analyse?</label>
            <textarea id="analysis-context" rows={4} />
          </div>
          <div className="checkbox-field">
            <input type="checkbox" id="b2b-confirm" />
            <label htmlFor="b2b-confirm">
              I confirm I am requesting access on behalf of a professional
              organisation.
            </label>
          </div>
          <button className="btn btn-primary access-submit" type="button">
            Submit access request
          </button>
        </Reveal>
      </div>
    </section>
  );
}
