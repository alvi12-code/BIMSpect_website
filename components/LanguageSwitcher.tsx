"use client";

import { preserveHash, setLocalePreference, type Locale } from "@/lib/locale";

export type LanguageSwitcherProps = {
  currentLabel: string;
  targetLabel: string;
  href: string;
  ariaLabel: string;
  targetLocale: Locale;
  className?: string;
};

export function LanguageSwitcher({
  currentLabel,
  targetLabel,
  href,
  ariaLabel,
  targetLocale,
  className = ""
}: LanguageSwitcherProps) {
  const navigateToLanguage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setLocalePreference(targetLocale);
    const targetHref = preserveHash(href, window.location.hash);

    if (targetHref !== href) {
      event.preventDefault();
      window.location.assign(targetHref);
    }
  };

  return (
    <div
      className={["language-switcher", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      <span className="language-switcher-current" aria-current="page">
        {currentLabel}
      </span>
      <span aria-hidden="true">|</span>
      <a href={href} aria-label={ariaLabel} onClick={navigateToLanguage}>
        {targetLabel}
      </a>
    </div>
  );
}
