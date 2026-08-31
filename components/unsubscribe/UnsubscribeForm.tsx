"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  type UnsubscribeTokenState,
  unsubscribeTokenState
} from "@/lib/unsubscribe";
import {
  requestUnsubscribeConfirmation,
  submitUnsubscribe
} from "./request";
import styles from "./unsubscribe.module.css";

type State =
  | "loading"
  | "missing"
  | "ready"
  | "submitting"
  | "success"
  | "invalid"
  | "error";

type EmailRequestState =
  | "idle"
  | "submitting"
  | "success"
  | "invalid"
  | "error";

export function UnsubscribeForm({
  initialTokenState
}: {
  initialTokenState: UnsubscribeTokenState;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<State>(
    initialTokenState === "missing"
      ? "missing"
      : initialTokenState === "invalid"
        ? "invalid"
        : "loading"
  );
  const [emailRequestState, setEmailRequestState] =
    useState<EmailRequestState>("idle");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const value = new URLSearchParams(window.location.search).get("token");
      const tokenState = unsubscribeTokenState(value);

      if (tokenState === "missing") {
        setState("missing");
        return;
      }

      if (tokenState === "invalid") {
        setState("invalid");
        return;
      }

      setToken(value);
      setState("ready");
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  async function unsubscribe() {
    if (!token || state !== "ready") {
      return;
    }

    setState("submitting");

    try {
      setState(await submitUnsubscribe(token));
    } catch {
      setState("error");
    }
  }

  async function requestConfirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.reportValidity() || emailRequestState === "submitting") {
      return;
    }

    const email = String(new FormData(form).get("email") ?? "").trim();
    setEmailRequestState("submitting");

    try {
      setEmailRequestState(await requestUnsubscribeConfirmation(email));
    } catch {
      setEmailRequestState("error");
    }
  }

  if (state === "success") {
    return (
      <>
        <h1>You’ve been unsubscribed</h1>
        <p>
          Your request has been recorded and you will no longer receive BIMSpect
          marketing emails.
        </p>
        <p className={styles.secondaryCopy}>
          You may still receive essential service or account-related messages where
          applicable.
        </p>
      </>
    );
  }

  if (state === "invalid") {
    return (
      <>
        <h1>This unsubscribe link is not valid.</h1>
        <p>Please use the unsubscribe link from a BIMSpect marketing email.</p>
      </>
    );
  }

  if (state === "missing") {
    return (
      <>
        <h1>Unsubscribe from BIMSpect emails</h1>
        <p>
          Enter the email address that receives BIMSpect marketing messages. We’ll
          send a confirmation link before changing your email preferences.
        </p>
        <form
          className={styles.emailForm}
          onSubmit={requestConfirmation}
          aria-describedby="unsubscribe-email-request-status"
          aria-busy={emailRequestState === "submitting"}
        >
          <label htmlFor="unsubscribe-email">Email address</label>
          <input
            id="unsubscribe-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            disabled={emailRequestState === "success"}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={
              emailRequestState === "submitting" || emailRequestState === "success"
            }
          >
            {emailRequestState === "submitting"
              ? "Sending confirmation link…"
              : emailRequestState === "success"
                ? "Confirmation link requested"
                : "Send confirmation link"}
          </button>
          <p
            id="unsubscribe-email-request-status"
            className={[
              styles.emailRequestStatus,
              emailRequestState === "error" || emailRequestState === "invalid"
                ? styles.error
                : ""
            ]
              .filter(Boolean)
              .join(" ")}
            role={emailRequestState === "error" || emailRequestState === "invalid" ? "alert" : "status"}
            aria-live="polite"
          >
            {emailRequestState === "success"
              ? "If this address receives BIMSpect marketing emails, we’ll send a confirmation link shortly."
              : emailRequestState === "invalid"
                ? "Enter a valid email address."
                : emailRequestState === "error"
                  ? "We couldn’t send a confirmation link right now. Please try again."
                  : ""}
          </p>
        </form>
        <p className={styles.secondaryCopy}>
          We use this address only to process this preference request. The
          confirmation link must be opened before any change is made.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Unsubscribe from BIMSpect emails</h1>
      <p>You can stop receiving BIMSpect marketing emails using the button below.</p>
      <button
        className="btn btn-primary"
        type="button"
        onClick={unsubscribe}
        disabled={state === "loading" || state === "submitting"}
      >
        {state === "submitting" ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      {state === "error" ? (
        <p className={styles.error} role="alert">
          We couldn’t process your request right now. Please try again.
        </p>
      ) : null}
      <p className={styles.secondaryCopy}>
        This only affects marketing emails. Essential service or account-related
        messages may still be sent where applicable.
      </p>
    </>
  );
}
