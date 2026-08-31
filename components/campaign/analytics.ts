"use client";

import { useEffect, useRef } from "react";
import { getCampaignAttribution } from "./attribution";
import { recordCampaignVisit } from "./visit";

type CampaignEventName =
  | "campaign_page_view"
  | "video_play"
  | "cta_click"
  | "form_start"
  | "form_submit"
  | "form_error";

type CampaignEventProperties = Record<string, string | undefined>;

type AnalyticsWindow = Window & {
  posthog?: { capture: (event: string, properties?: CampaignEventProperties) => void };
  gtag?: (command: string, event: string, properties?: CampaignEventProperties) => void;
};

export function campaignEventProperties({
  landingPage,
  campaign
}: {
  landingPage: string;
  campaign: string;
}): CampaignEventProperties {
  const attribution = getCampaignAttribution();

  return {
    landing_page: landingPage,
    campaign,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term
  };
}

export function trackCampaignEvent(
  event: CampaignEventName,
  properties: CampaignEventProperties
) {
  if (typeof window === "undefined") {
    return;
  }

  const analytics = window as AnalyticsWindow;

  if (analytics.posthog) {
    analytics.posthog.capture(event, properties);
    return;
  }

  if (analytics.gtag) {
    analytics.gtag("event", event, properties);
  }
}

export function CampaignAnalytics({
  landingPage,
  campaign
}: {
  landingPage: string;
  campaign: string;
}) {
  const hasTrackedPageView = useRef(false);

  useEffect(() => {
    const properties = campaignEventProperties({ landingPage, campaign });

    if (!hasTrackedPageView.current) {
      trackCampaignEvent("campaign_page_view", properties);
      recordCampaignVisit({ landingPage, campaign });
      hasTrackedPageView.current = true;
    }

    function trackCtaClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest("a");
      if (
        !link ||
        !link.matches("a.btn, a.btn-inv, a.btn-white, a.btn-outline-white, a.nav-cta")
      ) {
        return;
      }

      trackCampaignEvent("cta_click", {
        ...properties,
        cta_label: link.textContent?.trim().slice(0, 120),
        cta_href: link.getAttribute("href") ?? undefined
      });
    }

    document.addEventListener("click", trackCtaClick);
    return () => document.removeEventListener("click", trackCtaClick);
  }, [campaign, landingPage]);

  return null;
}
