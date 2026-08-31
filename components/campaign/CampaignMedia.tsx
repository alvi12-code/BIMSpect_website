"use client";

import Image from "next/image";
import { ModelAttribution } from "@/components/ModelAttribution";
import { campaignEventProperties, trackCampaignEvent } from "./analytics";
import { campaignBusinessConfig, campaignMedia } from "./content";
import styles from "./campaign.module.css";

type CampaignVideoProps = {
  landingPage: "pilot" | "what-changed";
  label: string;
  caption: string;
};

export function CampaignVideo({ landingPage, label, caption }: CampaignVideoProps) {
  return (
    <figure className={styles.mediaFigure}>
      <div className={styles.browserFrame}>
        <div className={styles.browserBar}>
          <span className={styles.browserDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>{label}</span>
        </div>
        <div className={styles.videoStage}>
          <video
            className={styles.video}
            src={campaignMedia.video}
            controls
            playsInline
            preload="metadata"
            aria-label="BIMSpect walkthrough of colour-coded model changes and change-type filtering"
            onPlay={() => {
              trackCampaignEvent(
                "video_play",
                campaignEventProperties({
                  landingPage,
                  campaign: campaignBusinessConfig.campaign
                })
              );
            }}
          />
        </div>
      </div>
      <figcaption className={styles.imageCaption}>{caption}</figcaption>
      <ModelAttribution className={styles.modelAttribution} />
    </figure>
  );
}

type CampaignImageFrameProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  caption?: string;
  priority?: boolean;
  contain?: boolean;
};

export function CampaignImageFrame({
  src,
  width,
  height,
  alt,
  label,
  caption,
  priority = false,
  contain = false
}: CampaignImageFrameProps) {
  return (
    <figure className={styles.mediaFigure}>
      <div className={styles.browserFrame}>
        <div className={styles.browserBar}>
          <span className={styles.browserDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>{label}</span>
        </div>
        <div className={contain ? styles.imageStageContain : styles.imageStage}>
          <Image
            src={src}
            width={width}
            height={height}
            alt={alt}
            sizes="(max-width: 768px) calc(100vw - 40px), 58vw"
            priority={priority}
          />
        </div>
      </div>
      {caption ? <figcaption className={styles.imageCaption}>{caption}</figcaption> : null}
    </figure>
  );
}
