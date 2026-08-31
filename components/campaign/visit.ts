"use client";

import {
  getCampaignAttribution,
  getCurrentCampaignPageAttribution
} from "./attribution";

const VISIT_STORAGE_KEY_PREFIX = "bimspect_campaign_visit_id:";

function visitStorageKey(landingPage: string) {
  return `${VISIT_STORAGE_KEY_PREFIX}${landingPage}`;
}

function visitId(landingPage: string): string | null {
  try {
    const key = visitStorageKey(landingPage);
    const stored = window.sessionStorage.getItem(key);

    if (stored && /^[a-zA-Z0-9-]{16,128}$/.test(stored)) {
      return stored;
    }

    if (typeof crypto.randomUUID !== "function") {
      return null;
    }

    const created = crypto.randomUUID();
    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    // Session storage may be unavailable in privacy-restricted browsers. The
    // page continues to work; omitting the visit is preferable to counting
    // refreshes as independent sessions.
    return null;
  }
}

export function recordCampaignVisit({
  landingPage,
  campaign
}: {
  landingPage: string;
  campaign: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const id = visitId(landingPage);
  if (!id) {
    return;
  }

  const attribution = getCampaignAttribution();
  const pageAttribution = getCurrentCampaignPageAttribution();
  void fetch("/api/campaign/visits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({
      visit_id: id,
      campaign,
      ...attribution,
      ...pageAttribution
    })
  }).catch(() => {
    // Visit reporting is intentionally best-effort and must never interrupt a
    // campaign page or its enquiry workflow.
  });
}
