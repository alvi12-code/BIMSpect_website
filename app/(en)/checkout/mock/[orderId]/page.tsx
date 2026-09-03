import { notFound } from "next/navigation";
import { MockCheckoutControls } from "@/components/payment/MockCheckoutControls";
import { OrderDetails } from "@/components/payment/OrderDetails";
import { PaymentShell } from "@/components/payment/PaymentShell";
import styles from "@/components/payment/payment.module.css";
import { isCheckoutEnabled, paymentProviderName } from "@/lib/payment";
import { getPaymentOrder } from "@/lib/payment/service";

export const dynamic = "force-dynamic";

export default async function MockCheckoutPage({
  params
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  let order;

  try {
    if (!isCheckoutEnabled() || paymentProviderName() !== "mock") {
      notFound();
    }
    order = await getPaymentOrder(orderId);
  } catch {
    notFound();
  }

  if (!order || order.provider !== "mock") {
    notFound();
  }

  return (
    <PaymentShell>
      <section className={styles.section}>
        <div className="wrap">
          <article className={styles.mockCard}>
            <p className={styles.mockBanner}>Mock payment — development/testing only</p>
            <p className="eyebrow">BIMSpect Oy hosted checkout</p>
            <h1>Complete mock payment</h1>
            <p>
              This screen is a local BIMSpect test checkout. It does not process a
              card, use Revolut branding, or make a real payment request.
            </p>
            <OrderDetails order={order} />
            <MockCheckoutControls
              orderId={order.id}
              offerId={order.offer.id}
              orderReference={order.reference}
              disabled={order.status !== "pending" && order.status !== "processing"}
            />
          </article>
        </div>
      </section>
    </PaymentShell>
  );
}
