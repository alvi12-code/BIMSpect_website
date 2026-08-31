export type Locale = "en" | "fi";

export type BrowserLocalePreference = Locale | "unknown";

export type LocaleHint = {
  explicitLocale: Locale | null;
  browserLocale: BrowserLocalePreference;
  countrySuggestsFinnish: boolean;
  shouldSuggestFinnish: boolean;
};

export const LOCALE_COOKIE_NAME = "bimspect_locale";
export const LOCALE_SUGGESTION_DISMISSAL_COOKIE = "bimspect_locale_suggestion_dismissed";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LanguageCandidate = {
  locale: Locale;
  quality: number;
  position: number;
};

export function parseLocalePreference(value: string | undefined): Locale | null {
  return value === "en" || value === "fi" ? value : null;
}

function localeFromLanguageRange(range: string): Locale | null {
  const normalized = range.trim().toLowerCase();

  if (normalized === "en" || normalized.startsWith("en-")) {
    return "en";
  }

  if (normalized === "fi" || normalized.startsWith("fi-")) {
    return "fi";
  }

  return null;
}

function qualityFromLanguagePart(parts: string[]): number | null {
  const qualityPart = parts.slice(1).find((part) => part.trim().startsWith("q="));

  if (!qualityPart) {
    return 1;
  }

  const quality = Number(qualityPart.trim().slice(2));
  return Number.isFinite(quality) && quality >= 0 && quality <= 1 ? quality : null;
}

/**
 * Returns the preferred supported browser language. Unrelated language ranges
 * are ignored, while quality values and header order decide between EN and FI.
 */
export function preferredBrowserLocale(
  acceptLanguage: string | null | undefined
): BrowserLocalePreference {
  if (!acceptLanguage) {
    return "unknown";
  }

  const candidates: LanguageCandidate[] = [];

  for (const [position, part] of acceptLanguage.split(",").entries()) {
    const sections = part.split(";");
    const locale = localeFromLanguageRange(sections[0] ?? "");
    const quality = qualityFromLanguagePart(sections);

    if (!locale || quality === null || quality === 0) {
      continue;
    }

    candidates.push({ locale, quality, position });
  }

  if (candidates.length === 0) {
    return "unknown";
  }

  candidates.sort((left, right) => right.quality - left.quality || left.position - right.position);
  return candidates[0]?.locale ?? "unknown";
}

/**
 * Determines whether the English homepage may offer Finnish as an option.
 * This intentionally never instructs callers to redirect a visitor.
 */
export function resolveLocaleHint({
  cookie,
  acceptLanguage,
  country,
  suggestionDismissed = false
}: {
  cookie: string | undefined;
  acceptLanguage: string | null | undefined;
  country: string | null | undefined;
  suggestionDismissed?: boolean;
}): LocaleHint {
  const explicitLocale = parseLocalePreference(cookie);
  const browserLocale = preferredBrowserLocale(acceptLanguage);
  const countrySuggestsFinnish = country?.trim().toUpperCase() === "FI";

  return {
    explicitLocale,
    browserLocale,
    countrySuggestsFinnish,
    shouldSuggestFinnish:
      !suggestionDismissed &&
      explicitLocale === null &&
      (browserLocale === "fi" || (browserLocale === "unknown" && countrySuggestsFinnish))
  };
}

/** Sets the explicit UX preference after a deliberate language selection. */
export function setLocalePreference(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Max-Age=${LOCALE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

/** Suppresses the optional prompt until the browser session ends. */
export function dismissLanguageSuggestionForSession() {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_SUGGESTION_DISMISSAL_COOKIE}=1; Path=/; SameSite=Lax${secure}`;
}

export function preserveHash(href: string, hash: string) {
  if (!hash || !hash.startsWith("#")) {
    return href;
  }

  return `${href}${hash}`;
}
