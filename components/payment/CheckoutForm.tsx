"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  paymentEventProperties,
  trackBimspectEvent
} from "@/components/campaign/analytics";
import { getCampaignAttribution } from "@/components/campaign/attribution";
import type { PaymentOffer } from "@/lib/payment";
import styles from "./payment.module.css";

type CheckoutFormProps = {
  offer: PaymentOffer;
};

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

type CreateOrderResponse = {
  order?: {
    id: string;
    reference: string;
    checkoutUrl: string;
  };
  error?: { code?: string; message?: string };
};

export function CheckoutForm({ offer }: CheckoutFormProps) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const idempotencyKey = useRef<string | undefined>(undefined);
  const submitting = state.status === "submitting";

  useEffect(() => {
    trackBimspectEvent("checkout_started", paymentEventProperties({ offerId: offer.id }));
  }, [offer.id]);

  function checkoutIdempotencyKey() {
    if (!idempotencyKey.current && typeof crypto.randomUUID === "function") {
      idempotencyKey.current = crypto.randomUUID();
    }

    return idempotencyKey.current;
  }

  function resetIdempotencyKey() {
    if (!submitting) {
      idempotencyKey.current = undefined;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (submitting || !form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    setState({ status: "submitting" });
    trackBimspectEvent("checkout_submitted", paymentEventProperties({ offerId: offer.id }));

    try {
      const key = checkoutIdempotencyKey();
      const response = await fetch("/api/payments/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { "Idempotency-Key": key } : {})
        },
        credentials: "same-origin",
        body: JSON.stringify({
          name: String(formData.get("name") ?? "").trim(),
          company: String(formData.get("company") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          vatNumber: String(formData.get("vatNumber") ?? "").trim() || undefined,
          termsAccepted: formData.get("termsAccepted") === "on",
          attribution: getCampaignAttribution()
        })
      });
      const result = (await response.json().catch(() => null)) as CreateOrderResponse | null;

      if (!response.ok || !result?.order?.checkoutUrl) {
        throw new Error(result?.error?.message || "We could not start checkout.");
      }

      trackBimspectEvent(
        "payment_order_created",
        paymentEventProperties({ offerId: offer.id, orderReference: result.order.reference })
      );
      window.location.assign(result.order.checkoutUrl);
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not start checkout. Please try again or contact BIMSpect."
      });
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onInputCapture={resetIdempotencyKey}
      aria-busy={submitting}
    >
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Name</span>
          <input name="name" type="text" autoComplete="name" maxLength={160} required />
        </label>
        <label className={styles.field}>
          <span>Company</span>
          <input
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={200}
            required
          />
        </label>
      </div>
      <label className={styles.field}>
        <span>Business email</span>
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <label className={styles.field}>
        <span>VAT number / Business ID <em>Optional</em></span>
        <input name="vatNumber" type="text" autoComplete="off" maxLength={80} />
      </label>
      <label className={styles.checkbox}>
        <input name="termsAccepted" type="checkbox" required />
        <span>
          I confirm that I am authorised to purchase for this organisation and
          acknowledge that BIMSpect will use these details to process this order.
        </span>
      </label>
      <button className="btn btn-primary" type="submit" disabled={submitting}>
        {submitting ? "Starting secure checkout…" : "Continue to checkout"}
      </button>
      {state.status === "error" ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}
      <p className={styles.secureNote}>
        <span aria-hidden="true">⌁</span> Secure checkout. BIMSpect never asks for card
        details on this page; they are handled by the hosted payment checkout.
      </p>
    </form>
  );
}
