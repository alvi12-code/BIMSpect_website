"use client";

import { useRef, useState, type FormEvent } from "react";
import { getCampaignAttribution } from "./attribution";
import { campaignEventProperties, trackCampaignEvent } from "./analytics";
import { campaignBusinessConfig } from "./content";
import {
  submitCampaignRequest,
  type CampaignRequestKind
} from "./submitCampaignRequest";
import { hasTurnstileSiteKey, Turnstile } from "./Turnstile";
import styles from "./campaign.module.css";

type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

type CampaignFormProps = {
  kind: CampaignRequestKind;
  landingPage: "pilot" | "what-changed";
  submitLabel: string;
  includeQuestion?: boolean;
};

export function CampaignForm({
  kind,
  landingPage,
  submitLabel,
  includeQuestion = false
}: CampaignFormProps) {
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetVersion, setTurnstileResetVersion] = useState(0);
  const hasStarted = useRef(false);
  const isSubmittingRef = useRef(false);
  const submissionIdempotencyKey = useRef<string | undefined>(undefined);
  const prefix = kind === "sample-report" ? "sample" : "pilot";
  const statusId = `${prefix}-form-status`;
  const eventProperties = () =>
    campaignEventProperties({
      landingPage,
      campaign: campaignBusinessConfig.campaign
    });

  function trackFormStart() {
    if (hasStarted.current) {
      return;
    }

    hasStarted.current = true;
    trackCampaignEvent("form_start", eventProperties());
  }

  function retryKey() {
    if (!submissionIdempotencyKey.current && typeof crypto.randomUUID === "function") {
      submissionIdempotencyKey.current = crypto.randomUUID();
    }

    return submissionIdempotencyKey.current;
  }

  function resetRetryKey() {
    if (!isSubmittingRef.current) {
      submissionIdempotencyKey.current = undefined;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (isSubmittingRef.current || !form.reportValidity()) {
      return;
    }

    if (hasTurnstileSiteKey && !turnstileToken) {
      setState({
        status: "error",
        message: "Please complete the verification before submitting your request."
      });
      trackCampaignEvent("form_error", {
        ...eventProperties(),
        reason: "verification_missing"
      });
      return;
    }

    const formData = new FormData(form);
    isSubmittingRef.current = true;
    setState({ status: "submitting" });
    trackCampaignEvent("form_submit", eventProperties());

    try {
      await submitCampaignRequest({
        kind,
        name: String(formData.get("name") ?? "").trim(),
        company: String(formData.get("company") ?? "").trim(),
        email: String(formData.get("workEmail") ?? "").trim(),
        message: includeQuestion
          ? String(formData.get("question") ?? "").trim()
          : undefined,
        campaign: campaignBusinessConfig.campaign,
        attribution: getCampaignAttribution(),
        turnstile_token: turnstileToken || undefined,
        idempotencyKey: retryKey()
      });

      setState({
        status: "success",
        message: "We’ll be in touch with you shortly."
      });
    } catch {
      setState({
        status: "error",
        message: `We could not submit your request. Please try again, or email ${campaignBusinessConfig.contactEmail}.`
      });
      setTurnstileToken("");
      setTurnstileResetVersion((version) => version + 1);
      trackCampaignEvent("form_error", {
        ...eventProperties(),
        reason: "submission_failed"
      });
    } finally {
      isSubmittingRef.current = false;
    }
  }

  const isSubmitting = state.status === "submitting";
  const isComplete = state.status === "success";

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      onFocusCapture={trackFormStart}
      onInputCapture={resetRetryKey}
      aria-describedby={statusId}
      aria-busy={isSubmitting}
    >
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-name`}>Name</label>
          <input
            id={`${prefix}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-company`}>Company</label>
          <input
            id={`${prefix}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            required
          />
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${prefix}-email`}>Work email</label>
        <input
          id={`${prefix}-email`}
          name="workEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
        />
      </div>
      {includeQuestion ? (
        <div className={styles.field}>
          <label htmlFor={`${prefix}-question`}>Question</label>
          <textarea
            id={`${prefix}-question`}
            name="question"
            rows={5}
            required
          />
        </div>
      ) : null}
      <Turnstile
        onToken={setTurnstileToken}
        onError={() => {
          setTurnstileToken("");
          setState({
            status: "error",
            message: "Verification could not be completed. Please refresh and try again."
          });
          trackCampaignEvent("form_error", {
            ...eventProperties(),
            reason: "verification_failed"
          });
        }}
        resetVersion={turnstileResetVersion}
      />
      <button
        className={`btn btn-primary ${styles.formSubmit}`}
        type="submit"
        disabled={isSubmitting || isComplete}
      >
        {isSubmitting ? "Sending request…" : isComplete ? "Request sent" : submitLabel}
      </button>
      <p
        id={statusId}
        className={[
          styles.formStatus,
          state.status === "error" ? styles.formError : ""
        ]
          .filter(Boolean)
          .join(" ")}
        role={state.status === "error" ? "alert" : "status"}
        aria-live="polite"
      >
        {state.status === "success" || state.status === "error" ? state.message : ""}
      </p>
      <p className={styles.privacyNote}>
        {campaignBusinessConfig.privacyHref ? (
          <>
            By submitting this form, you acknowledge our{" "}
            <a href={campaignBusinessConfig.privacyHref}>Privacy Policy</a>.
          </>
        ) : (
          <>
            By submitting, you ask BIMSpect to respond to this enquiry. Questions
            about how we handle contact details? Email{" "}
            <a href={`mailto:${campaignBusinessConfig.contactEmail}`}>
              {campaignBusinessConfig.contactEmail}
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}
