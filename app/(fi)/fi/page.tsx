import { HomePage } from "@/components/home/HomePage";
import { getHomeMetadata, homeContent } from "@/content/home";
import { languageSwitchHref } from "@/content/language";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = getHomeMetadata("fi");

export default async function FinnishHomePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;

  return <HomePage content={homeContent.fi} languageHref={languageSwitchHref("en", query)} />;
}
