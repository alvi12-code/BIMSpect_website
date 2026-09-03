export const campaignBusinessConfig = {
  campaign: "september-2026",
  contactEmail: "hello@bimspect.com",
  pricingHref: "/#pricing",
  privacyHref: null as string | null,
  pilotOfferPdfHref: null as string | null,
  sampleReportAssetHref: null as string | null
};

export const pilotCommercialCampaign = "pilot-commercial-conversion-2026";

export const campaignMedia = {
  video: "/videos/bimspect-design-change-demo-attributed.mp4",
  viewer: {
    src: "/images/bimspect/bimspect-viewer-change-visualization.png",
    width: 920,
    height: 936,
    alt: "BIMSpect Viewer showing a colour-coded IFC model change visualisation"
  },
  analytics: {
    src: "/images/bimspect/bimspect-discipline-analytics-dashboard.png",
    width: 1352,
    height: 728,
    alt: "BIMSpect Architectural Analytics dashboard showing model-version context"
  }
};

export const campaignFooterLinks = [
  { href: "/", label: "bimspect.com" },
  { href: "mailto:hello@bimspect.com", label: "hello@bimspect.com" },
  { href: "/unsubscribe", label: "Unsubscribe from BIMSpect emails" },
  {
    href: "https://www.linkedin.com/company/bimspect",
    label: "LinkedIn",
    external: true
  }
];

export const whatChangedNavigation = [
  { href: "#problem", label: "The problem" },
  { href: "#workflow", label: "How it works" },
  { href: "#sample-report", label: "Sample report" },
  { href: "#pricing", label: "Pricing" }
];

export const pilotNavigation = [
  { href: "#product", label: "Product" },
  { href: "#pricing", label: "Pricing" },
  { href: "#data-handling", label: "Data handling" },
  { href: "#contact", label: "Contact" }
];

export const pilotBenefits = [
  {
    icon: "browser" as const,
    title: "See design activity over time",
    description:
      "Understand how change volume and design activity develop across model versions."
  },
  {
    icon: "compare" as const,
    title: "Understand stability and review priorities",
    description:
      "Use design indicators to see where the model is still evolving and where the team should focus its review."
  },
  {
    icon: "collaborate" as const,
    title: "Investigate the evidence",
    description:
      "Move from a high-level analytics view back to the changed elements in the model."
  }
];

export type PilotBenefit = (typeof pilotBenefits)[number];

export const pilotTrustBenefits = [
  {
    icon: "browser" as const,
    title: "Browser-based access",
    description: "Use BIMSpect without installation, with IFC2x3 and IFC4 model files."
  },
  {
    icon: "compare" as const,
    title: "EU-based processing",
    description: "Project-file processing takes place within the EU."
  },
  {
    icon: "collaborate" as const,
    title: "Your data stays yours",
    description:
      "Customer project files are not used for AI training without written permission."
  }
] satisfies PilotBenefit[];

export const pilotWorkflow = [
  {
    number: "01",
    title: "Upload releases",
    description: "Bring the IFC model versions you need to compare into BIMSpect."
  },
  {
    number: "02",
    title: "Choose a view",
    description: "Focus the comparison by the project context that matters to your review."
  },
  {
    number: "03",
    title: "Review Design Buzz",
    description: "Map change concentration and inspect the model areas with the most activity."
  },
  {
    number: "04",
    title: "Report findings",
    description: "Share clear findings for BIM coordination and design-management discussions."
  }
];

export const pilotPricing = [
  {
    tier: "Individual",
    name: "BIMSpect Individual",
    audience:
      "For an individual BIM coordinator, consultant or design manager working across several projects.",
    availability: "€59 / month",
    cta: "Start individually"
  },
  {
    tier: "Project",
    name: "BIMSpect Project",
    audience:
      "For one active project and the team responsible for BIM and design coordination.",
    availability: "€1,490 / month",
    cta: "Discuss project access",
    featured: true
  },
  {
    tier: "Enterprise",
    name: "BIMSpect Enterprise",
    audience:
      "For organisations managing multiple projects, programmes or BIM portfolios.",
    availability: "Custom pricing",
    cta: "Discuss enterprise access"
  }
];

export const changeWorkflow = [
  {
    number: "01",
    title: "Upload model versions",
    description: "Bring the BIM model versions you need to compare into BIMSpect."
  },
  {
    number: "02",
    title: "BIMSpect analyses the changes",
    description: "BIMSpect compares the versions and structures the differences."
  },
  {
    number: "03",
    title: "Review what changed",
    description: "Inspect the changes directly in your browser and focus the review."
  }
];

export const changeAnnotations = [
  "Added elements",
  "Modified elements",
  "Removed elements",
  "Visual change context"
];
