"use client";

import { useEffect } from "react";
import {
  getCampaignAttribution,
  shouldCaptureCampaignAttribution
} from "./attribution";

export function AttributionCapture() {
  useEffect(() => {
    if (!shouldCaptureCampaignAttribution(window.location.pathname)) {
      return;
    }

    getCampaignAttribution();
  }, []);

  return null;
}
