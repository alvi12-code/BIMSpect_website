import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { campaignFooterLinks } from "@/components/campaign/content";
import { UnsubscribeForm } from "@/components/unsubscribe/UnsubscribeForm";
import styles from "@/components/unsubscribe/unsubscribe.module.css";
import { unsubscribeTokenState } from "@/lib/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe | BIMSpect",
  description: "Manage BIMSpect marketing email preferences.",
  robots: {
    index: false,
    follow: false
  },
  referrer: "no-referrer"
};

export default async function UnsubscribePage({
  searchParams
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const rawToken =
    typeof query.token === "string" ? query.token : query.token ? "" : null;
  const initialTokenState = unsubscribeTokenState(rawToken);

  return (
    <>
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="unsubscribe-heading">
          <Link className={styles.brand} href="/" aria-label="BIMSpect home">
            <Image
              src="/brand/bimspect-logo.png"
              alt="BIMSpect"
              className={styles.brandLogo}
              width={365}
              height={86}
              sizes="166px"
              priority
            />
          </Link>
          <div id="unsubscribe-heading">
            <UnsubscribeForm initialTokenState={initialTokenState} />
          </div>
        </section>
      </main>
      <Footer links={campaignFooterLinks} homeHref="/" useBrandImage />
    </>
  );
}
