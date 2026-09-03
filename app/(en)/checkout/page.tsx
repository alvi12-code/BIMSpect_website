import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/payment/CheckoutForm";
import { PaymentShell } from "@/components/payment/PaymentShell";
import styles from "@/components/payment/payment.module.css";
import {
  formatOfferAmount,
  getCurrentPurchasableOffer
} from "@/lib/payment/offer";
import { isCheckoutEnabled } from "@/lib/payment";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | BIMSpect",
  robots: { index: false, follow: false }
};

function CheckoutUnavailable() {
  return (
    <PaymentShell>
      <section className={styles.section}>
        <div className="wrap">
          <article className={styles.unavailableCard}>
            <p className="eyebrow">BIMSpect checkout</p>
            <h1>Checkout is not currently available</h1>
            <p>
              Please contact BIMSpect for an invoice, purchase order, or offer discussion.
            </p>
            <p className={styles.invoiceNote}>
              <Link href="/#contact">Contact BIMSpect about this offer</Link>
            </p>
          </article>
        </div>
      </section>
    </PaymentShell>
  );
}

export default function CheckoutPage() {
  const offer = getCurrentPurchasableOffer();

  if (!isCheckoutEnabled() || !offer) {
    return <CheckoutUnavailable />;
  }

  const amount = formatOfferAmount(offer.amount, offer.currency);

  return (
    <PaymentShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.intro}>
            <p className="eyebrow">BIMSpect secure checkout</p>
            <h1>Complete your business details</h1>
            <p>
              Your offer and price are confirmed by BIMSpect on the server before you
              continue to hosted checkout.
            </p>
          </div>
          <div className={styles.checkoutGrid}>
            <article className={styles.formCard}>
              <h2>Customer details</h2>
              <CheckoutForm offer={offer} />
            </article>
            <aside className={styles.summary} aria-label="Order summary">
              <h2>Order summary</h2>
              <div className={styles.summaryPlan}>
                <h3>{offer.name}</h3>
                <p>{offer.description}</p>
                {amount ? (
                  <strong className={styles.price}>
                    {amount}
                    {offer.billingPeriod ? <small>/ {offer.billingPeriod}</small> : null}
                  </strong>
                ) : (
                  <p className={styles.summaryMeta}>Price available on request.</p>
                )}
              </div>
              <div className={styles.summaryMeta}>
                {amount ? <p>Price excludes VAT.</p> : null}
                {offer.billingPeriod ? <p>Billing period: {offer.billingPeriod}.</p> : null}
              </div>
              <p className={styles.invoiceNote}>
                Need an invoice or purchase order? <Link href="/#contact">Contact us</Link>.
              </p>
            </aside>
          </div>
        </div>
      </section>
    </PaymentShell>
  );
}
