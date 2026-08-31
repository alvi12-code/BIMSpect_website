import type { Locale } from "@/lib/locale";

const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term"
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export function languageSwitchHref(targetLocale: Locale, searchParams: SearchParams) {
  const path = targetLocale === "fi" ? "/fi" : "/";
  const query = new URLSearchParams();

  for (const field of UTM_FIELDS) {
    const value = firstString(searchParams[field])?.trim();
    if (value) {
      query.set(field, value.slice(0, 255));
    }
  }

  const search = query.toString();
  return search ? `${path}?${search}` : path;
}
