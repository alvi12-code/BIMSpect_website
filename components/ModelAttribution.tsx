const medicalDentalSourceUrl =
  "https://github.com/buildingsmart-community/Community-Sample-Test-Files/tree/main/IFC%202.3.0.1%20%28IFC%202x3%29/Medical-Dental%20Clinic";

type ModelAttributionProps = {
  className?: string;
  content?: ModelAttributionContent;
};

const defaultContent: ModelAttributionContent = {
  ariaLabel: "Medical-Dental Clinic model attribution",
  description:
    "Based on BSI (2020), “Medical-Dental Test Files,” buildingSMART International, licensed under Creative Commons Attribution 4.0 (CC BY 4.0). The original IFC models have been modified to simulate design development, including changes to object presence, geometry, location and parameters.",
  sourceLabel: "Source:",
  sourceLinkLabel: "buildingSMART Community Sample Test Files"
};

export function ModelAttribution({
  className = "",
  content = defaultContent
}: ModelAttributionProps) {
  const classes = ["model-attribution", className].filter(Boolean).join(" ");

  return (
    <aside className={classes} aria-label={content.ariaLabel}>
      <p>{content.description}</p>
      <p>
        {content.sourceLabel}{" "}
        <a href={medicalDentalSourceUrl} target="_blank" rel="noopener noreferrer">
          {content.sourceLinkLabel}
        </a>
      </p>
    </aside>
  );
}
import type { ModelAttributionContent } from "@/content/home";
