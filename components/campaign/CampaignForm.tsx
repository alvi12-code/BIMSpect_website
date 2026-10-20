"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ENQUIRY_OPTIONS,
  GENERAL_ENQUIRY,
  SAMPLE_REPORT_REQUEST,
  enquiryIntentLabel,
  enquiryOptionValue,
  intentFromOptionValue,
  readEnquiryIntent,
  searchWithEnquiryIntent
} from "@/lib/enquiry-intent";
import { getCampaignAttribution } from "./attribution";
import { campaignEventProperties, trackCampaignEvent } from "./analytics";
import { CAMPAIGN_ENQUIRY_INTEREST_EVENT } from "./CampaignContactLink";
import { campaignBusinessConfig } from "./content";
import { replaceLocation, useLocationSearch } from "./location";
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

const formCopy = {
  en: {
    name: "Name",
    company: "Company",
    email: "Work email",
    topic: "Enquiry about",
    question: "Question",
    questionOptional: "Question (optional)",
    sending: "Sending request…",
    sent: "Request sent",
    success: "We’ll be in touch with you shortly.",
    failure: (email: string) =>
      `We could not submit your request. Please try again, or email ${email}.`,
    verificationMissing: "Please complete the verification before submitting your request.",
    verificationFailed: "Verification could not be completed. Please refresh and try again.",
    privacyBefore: "By submitting this form, you acknowledge our",
    privacyLink: "Privacy Policy",
    contactFallback:
      "By submitting, you ask BIMSpect to respond to this enquiry. Questions about how we handle contact details? Email",
    interest: (interest: string) => `I’m interested in ${interest}.`
  },
  fi: {
    name: "Nimi",
    company: "Yritys",
    email: "Työsähköposti",
    topic: "Tiedustelun aihe",
    question: "Kysymys",
    questionOptional: "Kysymys (valinnainen)",
    sending: "Lähetetään…",
    sent: "Pyyntö lähetetty",
    success: "Olemme sinuun yhteydessä pian.",
    failure: (email: string) =>
      `Pyynnön lähettäminen epäonnistui. Yritä uudelleen tai lähetä sähköpostia osoitteeseen ${email}.`,
    verificationMissing: "Suorita vahvistus ennen pyynnön lähettämistä.",
    verificationFailed: "Vahvistusta ei voitu suorittaa. Päivitä sivu ja yritä uudelleen.",
    privacyBefore: "Lähettämällä lomakkeen hyväksyt",
    privacyLink: "tietosuojaselosteemme",
    contactFallback:
      "Lähettämällä pyydät BIMSpectiä vastaamaan tähän tiedusteluun. Kysyttävää yhteystietojen käsittelystä? Lähetä sähköpostia osoitteeseen",
    interest: (interest: string) => `Olen kiinnostunut ${interest}.`
  }
};

type CampaignFormProps = {
  kind: CampaignRequestKind;
  landingPage: "homepage" | "pilot" | "what-changed";
  submitLabel: string;
  includeQuestion?: boolean;
  campaign?: string;
  locale?: "en" | "fi";
};

export function CampaignForm({
  kind,
  landingPage,
  submitLabel,
  includeQuestion = false,
  campaign = campaignBusinessConfig.campaign,
  locale = "en"
}: CampaignFormProps) {
  const copy = formCopy[locale];
  const [state, setState] = useState<FormState>({ status: "idle" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetVersion, setTurnstileResetVersion] = useState(0);
  const [question, setQuestion] = useState("");
  const search = useLocationSearch();
  // Enquiry forms show and submit the purpose carried by the URL; the visitor
  // corrects it with the select, which rewrites only the URL's enquiry
  // parameters. The question stays the visitor's own text throughout.
  const intent =
    kind === "sample-report"
      ? SAMPLE_REPORT_REQUEST
      : includeQuestion
        ? readEnquiryIntent(search) ?? GENERAL_ENQUIRY
        : GENERAL_ENQUIRY;
  const isQuestionRequired = intent.purpose === "general-enquiry";
  const hasStarted = useRef(false);
  const isSubmittingRef = useRef(false);
  const submissionIdempotencyKey = useRef<string | undefined>(undefined);
  const prefix =
    kind === "sample-report"
      ? "sample"
      : kind === "homepage-enquiry"
        ? "homepage"
        : "pilot";
  const statusId = `${prefix}-form-status`;
  const eventProperties = () =>
    campaignEventProperties({
      landingPage,
      campaign
    });

  useEffect(() => {
    if (!includeQuestion) {
      return;
    }

    function prefillQuestionFromPricing(event: Event) {
      const interest = (event as CustomEvent<unknown>).detail;

      // Plan and sample links carry their context in the URL instead.
      if (typeof interest !== "string" || !interest.trim()) {
        return;
      }

      setQuestion((currentQuestion) =>
        currentQuestion.trim()
          ? currentQuestion
          : formCopy[locale].interest(interest.trim())
      );
    }

    window.addEventListener(CAMPAIGN_ENQUIRY_INTEREST_EVENT, prefillQuestionFromPricing);
    return () =>
      window.removeEventListener(CAMPAIGN_ENQUIRY_INTEREST_EVENT, prefillQuestionFromPricing);
  }, [includeQuestion, locale]);

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
        message: copy.verificationMissing
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
          ? String(formData.get("question") ?? "").trim() || undefined
          : undefined,
        intent,
        campaign,
        attribution: getCampaignAttribution(),
        turnstile_token: turnstileToken || undefined,
        idempotencyKey: retryKey()
      });

      setState({
        status: "success",
        message: copy.success
      });
      trackCampaignEvent("form_success", eventProperties());
    } catch {
      setState({
        status: "error",
        message: copy.failure(campaignBusinessConfig.contactEmail)
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
          <label htmlFor={`${prefix}-name`}>{copy.name}</label>
          <input
            id={`${prefix}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-company`}>{copy.company}</label>
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
        <label htmlFor={`${prefix}-email`}>{copy.email}</label>
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
          <label htmlFor={`${prefix}-topic`}>{copy.topic}</label>
          <select
            id={`${prefix}-topic`}
            name="enquiryTopic"
            value={enquiryOptionValue(intent)}
            onChange={(event) => {
              const nextSearch = searchWithEnquiryIntent(
                window.location.search,
                intentFromOptionValue(event.target.value)
              );
              replaceLocation(
                `${window.location.pathname}${nextSearch}${window.location.hash}`
              );
            }}
          >
            {ENQUIRY_OPTIONS.map((option) => (
              <option key={enquiryOptionValue(option)} value={enquiryOptionValue(option)}>
                {enquiryIntentLabel(option, locale)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {includeQuestion ? (
        <div className={styles.field}>
          <label htmlFor={`${prefix}-question`}>
            {isQuestionRequired ? copy.question : copy.questionOptional}
          </label>
          <textarea
            id={`${prefix}-question`}
            name="question"
            rows={5}
            required={isQuestionRequired}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
        </div>
      ) : null}
      <Turnstile
        onToken={setTurnstileToken}
        onError={() => {
          setTurnstileToken("");
          setState({
            status: "error",
            message: copy.verificationFailed
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
        {isSubmitting ? copy.sending : isComplete ? copy.sent : submitLabel}
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
            {copy.privacyBefore}{" "}
            <a href={campaignBusinessConfig.privacyHref}>{copy.privacyLink}</a>.
          </>
        ) : (
          <>
            {copy.contactFallback}{" "}
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
