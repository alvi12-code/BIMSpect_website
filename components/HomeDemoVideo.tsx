"use client";

import { useState } from "react";
import type { HomeDemoVideoContent } from "@/content/home";

export function HomeDemoVideo({ content }: { content: HomeDemoVideoContent }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <figure className={`home-demo-frame${isPlaying ? " is-playing" : ""}`}>
      <video
        className="home-demo-video"
        controls
        playsInline
        preload="metadata"
        poster="/images/bimspect/bimspect-model-change-intensity.webp"
        aria-describedby="demo-description"
        aria-label={content.ariaLabel}
        onPlay={() => setIsPlaying(true)}
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
