import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://bimspect.com/",
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: "https://bimspect.com/fi",
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: "https://bimspect.com/what-changed",
      changeFrequency: "monthly",
      priority: 0.8
    }
  ];
}
