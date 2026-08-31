import Image from "next/image";
import { footerLinks, technicalFooterLinks } from "./data";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type FooterProps = {
  variant?: "commercial" | "technical";
  links?: FooterLink[];
  homeHref?: string;
  useBrandImage?: boolean;
  copyrightText?: string;
  accessibility?: {
    home: string;
    footer: string;
    footerNavigation: string;
  };
};

export function Footer({
  variant = "commercial",
  links: customLinks,
  homeHref = "#home",
  useBrandImage = false,
  copyrightText = "© 2026 BIMSpect Ltd",
  accessibility
}: FooterProps) {
  const links =
    customLinks ?? (variant === "technical" ? technicalFooterLinks : footerLinks);

  return (
    <footer aria-label={accessibility?.footer ?? "Site footer"}>
      <div className="wrap footer-inner">
        <a className="logo" href={homeHref} aria-label={accessibility?.home ?? "BIMSpect home"}>
          {useBrandImage ? (
            <Image
              src="/brand/bimspect-logo.png"
              alt="BIMSpect"
              className="footer-brand-logo"
              width={365}
              height={86}
              sizes="132px"
            />
          ) : (
            <>
              <span>BIM</span>Spect
            </>
          )}
        </a>
        <nav aria-label={accessibility?.footerNavigation ?? "Footer navigation"}>
          <ul className="footer-links">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer-copy">{copyrightText}</p>
      </div>
    </footer>
  );
}
