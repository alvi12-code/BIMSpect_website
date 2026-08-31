import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BIMSpect",
    short_name: "BIMSpect",
    description:
      "IFC model change analysis for BIM coordination, design management and construction teams.",
    start_url: "/",
    display: "browser",
    background_color: "#f5f4f1",
    theme_color: "#f5f4f1",
    icons: [
      {
        src: "/brand/bimspect-icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
}
