import { commercialNavLinks } from "./data";
import { LanguageSwitcher, type LanguageSwitcherProps } from "./LanguageSwitcher";

type NavigationLink = {
  href: string;
  label: string;
};

type NavigationCta = {
  href: string;
  label: string;
} | null;

type MobileNavigationProps = {
  open: boolean;
  onNavigate: () => void;
  links?: NavigationLink[];
  cta?: NavigationCta;
  languageSwitcher?: LanguageSwitcherProps & { mobileNavigationLabel: string };
};

export function MobileNavigation({
  open,
  onNavigate,
  links = commercialNavLinks,
  cta = { href: "#contact", label: "Request analysis" },
  languageSwitcher
}: MobileNavigationProps) {
  return (
    <nav
      id="mobile-nav"
      className={["mobile-nav", open ? "open" : ""].filter(Boolean).join(" ")}
      aria-label={languageSwitcher?.mobileNavigationLabel ?? "Mobile navigation"}
      aria-hidden={!open}
    >
      <div className="mobile-nav-inner">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={onNavigate}>
            {link.label}
          </a>
        ))}
        {cta ? (
          <a className="btn btn-primary" href={cta.href} onClick={onNavigate}>
            {cta.label}
          </a>
        ) : null}
        {languageSwitcher ? (
          <LanguageSwitcher {...languageSwitcher} className="mobile-language-switcher" />
        ) : null}
      </div>
    </nav>
  );
}
