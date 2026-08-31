import { ModelAttribution } from "@/components/ModelAttribution";

const VIDEO_SRC = "/videos/bimspect-design-change-demo-attributed.mp4";

export function HeroVideoPreview() {
  return (
    <aside
      className="hero-video-shell"
      aria-label="BIMSpect design-change demonstration"
    >
      <div className="hero-video-card">
        <div className="hero-video-topbar">
          <div className="hero-video-dots" aria-hidden="true">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
          </div>
          <span className="hero-video-label">BIMSpect design-change demo</span>
        </div>
        <div className="hero-video-stage">
          <video
            className="hero-video"
            src={VIDEO_SRC}
            controls
            playsInline
            preload="metadata"
            aria-label="BIMSpect walkthrough of colour-coded model changes and change-type filtering"
          />
        </div>
      </div>
      <p className="hero-video-caption">
        Review colour-coded model changes and change types in the BIMSpect 3D viewer.
      </p>
      <ModelAttribution />
    </aside>
  );
}
