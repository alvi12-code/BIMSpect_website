import { Reveal } from "@/components/Reveal";
import type { HomeContent } from "@/content/home";

// Restates audiences and standards the site already describes; adds no claims.
export function IndustryStrip({ content }: { content: HomeContent["industry"] }) {
  return (
    <section className="home-industry" aria-label={content.ariaLabel}>
      <Reveal className="wrap home-wrap home-industry-inner">
        <p className="home-industry-label">{content.label}</p>
        <ul className="home-industry-list">
          {content.audiences.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <span className="home-industry-divider" aria-hidden="true" />
        <ul className="home-industry-list home-industry-standards">
          {content.standards.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
