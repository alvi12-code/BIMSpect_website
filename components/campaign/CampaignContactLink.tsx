"use client";

import type { MouseEvent } from "react";
import {
  ENQUIRY_FRAGMENT,
  enquiryHref,
  enquiryOptionValue,
  intentFromOptionValue,
  type EnquiryIntent
} from "@/lib/enquiry-intent";
import { campaignEventProperties, trackCampaignEvent } from "./analytics";
import { campaignBusinessConfig } from "./content";
import { replaceLocation, useLocationSearch } from "./location";

export const CAMPAIGN_ENQUIRY_INTEREST_EVENT = "bimspect:campaign-enquiry-interest";

type CampaignContactLinkProps = {
  className: string;
  label: string;
  landingPage?: "homepage" | "pilot" | "what-changed";
  campaign?: string;
} & (
  | {
      // Free-text interest prefilled into an empty question (walkthroughs etc.).
      interest: string;
      intent?: never;
      path?: never;
    }
  | {
      // Finite plan/sample context carried in the link itself.
      intent: EnquiryIntent;
      // Page holding the enquiry form; defaults to the current page.
      path?: string;
      interest?: never;
    }
);

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function CampaignContactLink({
  className,
  interest,
  intent,
  path,
  label,
  landingPage = "homepage",
  campaign = campaignBusinessConfig.campaign
}: CampaignContactLinkProps) {
  const search = useLocationSearch();
  // Depend on the finite value, not the caller's object identity.
  const intentValue = intent ? enquiryOptionValue(intent) : null;
  const href = intentValue
    ? enquiryHref(intentFromOptionValue(intentValue), { path, search })
    : `#${ENQUIRY_FRAGMENT}`;

  function trackClick() {
    trackCampaignEvent("cta_click", {
      ...campaignEventProperties({
        landingPage,
        campaign
      }),
      cta_label: label,
      cta_href: `${path ?? ""}#${ENQUIRY_FRAGMENT}`
    });
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackClick();

    if (!intentValue) {
      window.dispatchEvent(
        new CustomEvent(CAMPAIGN_ENQUIRY_INTEREST_EVENT, { detail: interest })
      );
      return;
    }

    // Other pages, new tabs and modified clicks use the native link. On the
    // form's own page, update the query in place so a visitor's typed details
    // survive, then let the browser perform the ordinary fragment navigation.
    const target = new URL(href, window.location.href);
    if (
      !isPlainLeftClick(event) ||
      target.pathname !== window.location.pathname ||
      !document.getElementById(ENQUIRY_FRAGMENT)
    ) {
      return;
    }

    event.preventDefault();
    replaceLocation(`${target.pathname}${target.search}${window.location.hash}`);
    window.location.hash = ENQUIRY_FRAGMENT;
  }

  return (
    <a className={className} href={href} onClick={handleClick}>
      {label}
    </a>
  );
}
