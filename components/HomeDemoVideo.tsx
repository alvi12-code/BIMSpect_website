"use client";

import { useState } from "react";
import type { HomeDemoVideoContent } from "@/content/home";
import { campaignEventProperties, trackCampaignEvent } from "./campaign/analytics";

type HomeDemoVideoProps = {
  content: HomeDemoVideoContent;
  ariaDescribedBy?: string;
  campaign?: string;
  landingPage?: "pilot" | "what-changed";
};

export function HomeDemoVideo({
  content,
  ariaDescribedBy = "demo-description",
  campaign,
  landingPage
}: HomeDemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <figure className={`home-demo-frame${isPlaying ? " is-playing" : ""}`}>
      <video
        className="home-demo-video"
        controls
        playsInline
        preload="metadata"
        poster="/images/bimspect/bimspect-model-change-intensity.webp"
        aria-describedby={ariaDescribedBy}
        aria-label={content.ariaLabel}
        onPlay={() => {
          setIsPlaying(true);

          if (campaign && landingPage) {
            trackCampaignEvent(
              "video_play",
              campaignEventProperties({ landingPage, campaign })
            );
          }
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <source
          src="/videos/bimspect-design-change-demo-attributed.mp4"
          type="video/mp4"
        />
        {content.unsupportedBefore}{" "}
        <a href="/videos/bimspect-design-change-demo-attributed.mp4">
          {content.downloadLabel}
        </a>
        {content.unsupportedAfter}
      </video>
      <figcaption>{content.caption}</figcaption>
    </figure>
  );
}
