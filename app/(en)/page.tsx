import { cookies, headers } from "next/headers";
import { HomePage } from "@/components/home/HomePage";
import { getHomeMetadata, homeContent } from "@/content/home";
import { languageSwitchHref } from "@/content/language";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_SUGGESTION_DISMISSAL_COOKIE,
  resolveLocaleHint
} from "@/lib/locale";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = getHomeMetadata("en");

export default async function EnglishHomePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [query, requestCookies, requestHeaders] = await Promise.all([
    searchParams,
    cookies(),
    headers()
  ]);
  const localeHint = resolveLocaleHint({
    cookie: requestCookies.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: requestHeaders.get("accept-language"),
    country: requestHeaders.get("cf-ipcountry"),
    suggestionDismissed:
      requestCookies.get(LOCALE_SUGGESTION_DISMISSAL_COOKIE)?.value === "1"
  });

  return (
    <HomePage
      content={homeContent.en}
      languageHref={languageSwitchHref("fi", query)}
      shouldSuggestFinnish={localeHint.shouldSuggestFinnish}
    />
  );
}
