"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  paymentEventProperties,
  trackBimspectEvent
} from "@/components/campaign/analytics";
import styles from "./payment.module.css";

type Outcome = "paid" | "failed" | "cancelled";

export function MockCheckoutControls({
  orderId,
  offerId,
  orderReference,
  disabled = false
}: {
  orderId: string;
  offerId: string;
  orderReference: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const router = useRouter();

  async function simulate(outcome: Outcome) {
    if (state === "submitting" || disabled) {
      return;
    }

    setState("submitting");
    try {
      const response = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId, outcome })
      });
      const result = (await response.json().catch(() => null)) as {
        order?: { status?: Outcome };
      } | null;

      if (!response.ok || result?.order?.status !== outcome) {
        throw new Error("Mock payment update failed");
      }

      const properties = paymentEventProperties({ offerId, orderReference });
      if (outcome === "paid") {
        trackBimspectEvent("mock_payment_success", properties);
      } else if (outcome === "failed") {
        trackBimspectEvent("mock_payment_failed", properties);
      } else {
        trackBimspectEvent("checkout_cancelled", properties);
      }
      router.push(
        `/payment/${outcome === "paid" ? "success" : outcome}?order=${encodeURIComponent(orderId)}`
      );
    } catch {
      setState("error");
    }
  }

  if (disabled) {
    return <p className={styles.muted}>This mock order has already been completed.</p>;
  }

  return (
    <div className={styles.mockControls}>
      <p>Testing controls</p>
      <div className={styles.mockActions}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => void simulate("paid")}
          disabled={state === "submitting"}
        >
          Simulate successful payment
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => void simulate("failed")}
          disabled={state === "submitting"}
        >
          Simulate failed payment
        </button>
        <button
          className={styles.cancelButton}
          type="button"
          onClick={() => void simulate("cancelled")}
          disabled={state === "submitting"}
        >
          Cancel
        </button>
      </div>
      {state === "error" ? (
        <p className={styles.error} role="alert">
          We could not update this mock payment. Please try again.
        </p>
      ) : null}
    </div>
  );
}
