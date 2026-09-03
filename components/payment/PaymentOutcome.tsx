import Link from "next/link";
import { getPaymentOrder } from "@/lib/payment/service";
import type { PaymentOrder, PaymentStatus } from "@/lib/payment/types";
import { OrderDetails } from "./OrderDetails";
import { PaymentShell } from "./PaymentShell";
import styles from "./payment.module.css";

type Outcome = Extract<PaymentStatus, "paid" | "failed" | "cancelled">;

const outcomeCopy: Record<Outcome, { title: string; description: string; icon: string }> = {
  paid: {
    title: "Payment received",
    description:
      "Thank you for choosing BIMSpect. We will contact you with the next onboarding steps.",
    icon: "✓"
  },
  failed: {
    title: "Payment was not completed",
    description:
      "No payment has been recorded for this order. You can return to pricing or contact us for help.",
    icon: "!"
  },
  cancelled: {
    title: "Checkout cancelled",
    description:
      "No payment has been recorded. You can return to pricing whenever you are ready.",
    icon: "×"
  }
};

async function findOrder(orderId: string | undefined): Promise<PaymentOrder | null> {
  if (!orderId || !/^mock_[a-z0-9-]{16,128}$/i.test(orderId)) {
    return null;
  }

  try {
    return await getPaymentOrder(orderId);
  } catch {
    return null;
  }
}

export async function PaymentOutcome({
  outcome,
  orderId
}: {
  outcome: Outcome;
  orderId?: string;
}) {
  const expectedStatus = outcome;
  const order = await findOrder(orderId);
  const copy = outcomeCopy[outcome];

  if (!order || order.status !== expectedStatus) {
    return (
      <PaymentShell>
        <section className={styles.section}>
          <div className="wrap">
            <article className={styles.outcomeCard}>
              <span className={`${styles.outcomeIcon} ${styles.outcomeIconFailed}`} aria-hidden="true">
                ?
              </span>
              <h1>Payment confirmation pending</h1>
              <p>
                This page cannot confirm a payment. Please return to the hosted checkout
                or contact BIMSpect if you need help.
              </p>
              <div className={styles.outcomeActions}>
                <Link className="btn btn-primary" href="/#pricing">
                  Return to pricing
                </Link>
                <Link className="btn btn-secondary" href="/#contact">
                  Contact BIMSpect
                </Link>
              </div>
            </article>
          </div>
        </section>
      </PaymentShell>
    );
  }

  const isMock = order.provider === "mock";
  const failed = outcome !== "paid";

  return (
    <PaymentShell>
      <section className={styles.section}>
        <div className="wrap">
          <article className={styles.outcomeCard}>
            <span
              className={`${styles.outcomeIcon} ${failed ? styles.outcomeIconFailed : ""}`}
              aria-hidden="true"
            >
              {copy.icon}
            </span>
            <h1>{copy.title}</h1>
            <p>{copy.description}</p>
            {isMock ? (
              <p className={styles.testStatus}>
                Mock payment — development/testing only. No real payment has occurred.
              </p>
            ) : null}
            <div className={styles.outcomeDetails}>
              <OrderDetails order={order} />
            </div>
            <div className={styles.outcomeActions}>
              {outcome === "paid" ? (
                <Link className="btn btn-primary" href="/">
                  Return to BIMSpect
                </Link>
              ) : (
                <Link className="btn btn-primary" href="/#pricing">
                  Return to pricing
                </Link>
              )}
              <Link className="btn btn-secondary" href="/#contact">
                Contact BIMSpect
              </Link>
            </div>
          </article>
        </div>
      </section>
    </PaymentShell>
  );
}
