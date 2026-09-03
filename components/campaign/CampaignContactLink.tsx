"use client";

import { campaignEventProperties, trackCampaignEvent } from "./analytics";
import { campaignBusinessConfig } from "./content";

export const CAMPAIGN_ENQUIRY_INTEREST_EVENT = "bimspect:campaign-enquiry-interest";

type CampaignContactLinkProps = {
  className: string;
  interest: string;
  label: string;
  landingPage?: "homepage" | "pilot" | "what-changed";
  campaign?: string;
};

// Pricing interest is intentionally carried in the existing editable message
// field rather than introducing a second lead schema or CRM field.
export function CampaignContactLink({
  className,
  interest,
  label,
  landingPage = "homepage",
  campaign = campaignBusinessConfig.campaign
}: CampaignContactLinkProps) {
  return (
    <a
      className={className}
      href="#contact"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(CAMPAIGN_ENQUIRY_INTEREST_EVENT, { detail: interest })
        );
        trackCampaignEvent("cta_click", {
          ...campaignEventProperties({
            landingPage,
            campaign
          }),
          cta_label: label,
          cta_href: "#contact"
        });
      }}
    >
      {label}
    </a>
  );
}
